from sqlmodel import Session, select
from models import User, UserCreate, UserOut, Token, UserBase, Login
from database import get_session
from auth import create_access_token, create_refresh_token, verify_password, get_password_hash, get_current_user
from fastapi import APIRouter, Depends, HTTPException, Response, Cookie
from jose import jwt, JWTError
from auth import SECRET_KEY, ALGORITHM
from pydantic import BaseModel, Field

router = APIRouter(prefix="/auth", tags=["auth"])

class PasswordChangeRequest(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=8)

@router.post("/signup", response_model=Token, status_code=201)
def signup(user_data: UserCreate, response: Response, session: Session = Depends(get_session)):
    if session.exec(select(User).where(User.email == user_data.email)).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    if session.exec(select(User).where(User.username == user_data.username)).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    print("user_data", user_data)
    user = User(
        email=user_data.email,
        username=user_data.username,
        password=get_password_hash(user_data.password),
        role=user_data.role
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    
    accessToken = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "username": user.username,
        "role": user.role
    })
    refreshToken = create_refresh_token(user.id)
    response.set_cookie(key="refresh_token", value=refreshToken, secure=False, samesite="lax", httponly=True, max_age=3600*24*7)
    
    return Token(
        access_token=accessToken,
        token_type="bearer",
        user=UserOut(
            id=user.id,
            email=user.email,
            username=user.username,
            role=user.role
        )
    )

@router.post("/refresh", response_model=Token, status_code=200)
def refresh(response: Response,refresh_token: str = Cookie(default=None), session: Session = Depends(get_session)):
    print("refresh_token", refresh_token)
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        if user_id is None or token_type != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = session.exec(select(User).where(User.id == int(user_id))).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_refresh_token = create_refresh_token(user.id)
    response.set_cookie(key="refresh_token", value=new_refresh_token, secure=False, samesite="lax", httponly=True, max_age=3600*24*7)
    return Token(
        access_token=create_access_token({
            "sub": str(user.id),
            "email": user.email,
            "username": user.username,
            "role": user.role
        }),
        token_type="bearer",
        user=UserOut(
            id=user.id,
            email=user.email,
            username=user.username,
            role=user.role
        )
    )
"""
to test:
mail : fediba@gmail.com
password : password
"""
@router.post("/login", response_model=Token, status_code=200)
def login(user_data: Login, response: Response, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == user_data.email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_password(user_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid password")
    
    accessToken = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "username": user.username,
        "role": user.role
    })
    refreshToken = create_refresh_token(user.id)
    response.set_cookie(key="refresh_token", value=refreshToken, secure=False, samesite="lax", httponly=True, max_age=3600*24*7)
    return Token(
        access_token=accessToken,
        token_type="bearer",
        user=UserOut(
            id=user.id,
            email=user.email,
            username=user.username,
            role=user.role
        )
    )

@router.post("/logout")
def logout(response: Response):
    # Clear the refresh_token cookie on the server side
    response.delete_cookie(key="refresh_token", path="/", samesite="lax")
    return {"message": "Logged out successfully"}

@router.put("/change-password")
def change_password(
    password_data: PasswordChangeRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    user = session.get(User, current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(password_data.current_password, user.password):
        raise HTTPException(status_code=400, detail="Old password is incorrect")

    user.password = get_password_hash(password_data.new_password)
    session.add(user)
    session.commit()

    return {"message": "Password changed successfully"}
    
