from datetime import datetime, timedelta

import base64
import hashlib
import os

from jose import JWTError, jwt

import bcrypt

from fastapi import Depends, HTTPException, status

from fastapi.security import OAuth2PasswordBearer

from sqlalchemy.orm import Session

from database import get_session

from sqlmodel import select
from models import User
#from bcrypt import pwd_context

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
BCRYPT_SHA256_PREFIX = "$bcrypt-sha256$"

def _password_digest(password: str) -> bytes:
    digest = hashlib.sha256(password.encode("utf-8")).digest()
    return base64.b64encode(digest)

def _legacy_bcrypt_password(password: str) -> str:
    truncated_bytes = password.encode("utf-8")[:72]
    return truncated_bytes.decode("utf-8", errors="ignore")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        if hashed_password.startswith(BCRYPT_SHA256_PREFIX):
            bcrypt_hash = hashed_password[len(BCRYPT_SHA256_PREFIX):].encode("utf-8")
            return bcrypt.checkpw(_password_digest(plain_password), bcrypt_hash)

        legacy_password = _legacy_bcrypt_password(plain_password).encode("utf-8")
        return bcrypt.checkpw(legacy_password, hashed_password.encode("utf-8"))
    except ValueError:
        return False

def get_password_hash(password: str) -> str:
    bcrypt_hash = bcrypt.hashpw(_password_digest(password), bcrypt.gensalt())
    return BCRYPT_SHA256_PREFIX + bcrypt_hash.decode("utf-8")

def create_token(data: dict, expires_delta: timedelta) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + expires_delta
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_access_token(user_data:dict) -> str:
    return create_token(user_data, timedelta(minutes=60))

def create_refresh_token(user_id: int) -> str:
    return create_token({"sub": str(user_id), "type": "refresh"}, timedelta(days=365))

def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        user_id_int = int(user_id)
    except (JWTError, ValueError, TypeError):
        raise credentials_exception

    user = session.exec(select(User).where(User.id == user_id_int)).first()
    if user is None:
        raise credentials_exception
    return user
