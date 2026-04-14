from sqlmodel import Session, select
from models import Users,UserCreate,UserOut,Token,UserBase,loginReq,User
from database import get_session
from auth import create_access_token, create_refresh_token, verify_password, get_password_hash
from fastapi import APIRouter, Depends, HTTPException, Response,Cookie
from jose import jwt,JWTError
from auth import SECRET_KEY,ALGORITHM

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup",response_model=UserOut,status_code=201)
def signup(user_data:UserCreate,session:Session=Depends(get_session)):
    if session.exec(select(Users).where(Users.email == user_data.email)).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    if session.exec(select(Users).where(Users.username == user_data.username)).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    user = Users(
        email = user_data.email,
        username = user_data.username,
        password_hash = get_password_hash(user_data.password_hash),
        role = "member"
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.post("/refresh",response_model=Token,status_code=200)
def refresh(response:Response,refresh_token:str=Cookie("refresh_token"),session:Session=Depends(get_session)):
    print(refresh_token)
    try:
        print("this is try")
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        print(payload)
        user_id: str = payload.get("sub")
        print(user_id)
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except JWTError:
        print("this is except")
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = session.exec(select(Users).where(Users.id == int(user_id))).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    refresh_token = create_refresh_token(user.id)
    response.set_cookie(key="refresh_token",value=refresh_token,secure=False,samesite="strict",httponly=True,max_age=3600*24*7)
    return Token(
        access_token = create_access_token({
            "sub": str(user.id),
            "email": user.email,
            "username": user.username,
            "role": user.role
            }),
        token_type = "bearer",
        user = User(
            id = user.id,
            email = user.email,
            username = user.username,
            role = user.role
        )
    )
    

@router.post("/login",response_model=Token,status_code=200)
def login(user_data:loginReq, response: Response, session: Session = Depends(get_session)):
    user = session.exec(select(Users).where(Users.email == user_data.email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_password(user_data.password_hash, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid password")
    accessToken = create_access_token({
            "sub": str(user.id),
            "email": user.email,
            "username": user.username,
            "role": user.role
            })
    refreshToken = create_refresh_token(user.id)
    response.set_cookie(key="refresh_token",value=refreshToken,secure=False,samesite="strict",httponly=True,max_age=3600*24*7)
    return Token(
        access_token = accessToken,
        token_type = "bearer",
        user = User(
            id = user.id,
            email = user.email,
            username = user.username,
            role = user.role
        )
    )
    
