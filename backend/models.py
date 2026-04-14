from sqlmodel import SQLModel, Field
from sqlalchemy import Column, String, Text, Integer, Float, DateTime
from typing import Optional
from datetime import datetime

class Tasks(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(sa_column=Column(Integer))
    title: str = Field(sa_column=Column(String(50)))
    created_by: int = Field(sa_column=Column(Integer))

class Subtasks(SQLModel,table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: int = Field(sa_column=Column(Integer))
    title: str = Field(sa_column=Column(String(50)))
    weight_percentage: float = Field(sa_column=Column(Float))
    assigned_to: int = Field(sa_column=Column(Integer))
    status: str = Field(sa_column=Column(String(50)))
    
class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    username: str = Field(unique=True, index=True)
class User(SQLModel):
    id: int
    email: str
    username: str
    role: str

class Users(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    role: str = Field(sa_column=Column(String(50)))
    password_hash: str
    created_at: Optional[datetime] = Field(default_factory=datetime.now, sa_column=Column(DateTime))

class UserCreate(UserBase):
    password_hash: str


class loginReq(SQLModel):
    email:str
    password_hash:str

class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"
    user:User

class UserOut(UserBase):
    id: int

class Login(SQLModel):
    email: str
    password: str
