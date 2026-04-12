from sqlmodel import Session, select
from models import Users,UserCreate,UserOut,Token,UserBase,loginReq
from database import get_session
from auth import create_access_token, create_refresh_token
from fastapi import APIRouter, Depends, HTTPException, Response

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
        password_hash = user_data.password_hash,
        role = "member"
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.post("/login",response_model=Token,status_code=200)
def login(user_data:loginReq, response: Response, session: Session = Depends(get_session)):
    user = session.exec(select(Users).where(Users.email == user_data.email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.password_hash != user_data.password_hash:
        raise HTTPException(status_code=401, detail="Invalid password")
    response.set_cookie(key="access_token",value=create_access_token(data={
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "role": user.role
            }),secure=True,samesite="strict",max_age=3600)
    return Token(
        access_token = create_access_token(data={
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "role": user.role
            }),
        refresh_token = create_refresh_token(user.id),
        token_type = "bearer"
    )
    
