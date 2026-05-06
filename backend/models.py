from sqlmodel import SQLModel, Field

from sqlalchemy import Column, String, Text, Integer, Float, DateTime

from typing import Optional

from datetime import datetime



class Tasks(SQLModel, table=True):
    __tablename__ = "tasks"
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(sa_column=Column(Integer))
    title: str = Field(sa_column=Column(String(50)))
    created_by: int = Field(sa_column=Column(Integer))

class Subtasks(SQLModel, table=True):
    __tablename__ = "subtasks"
    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: int = Field(sa_column=Column(Integer))
    title: str = Field(sa_column=Column(String(50)))
    weight_percentage: float = Field(sa_column=Column(Float))
    assigned_to: int = Field(sa_column=Column(Integer))
    status: str = Field(sa_column=Column(String(50)))

class Submission(SQLModel, table=True):
    __tablename__ = "submission"
    id: Optional[int] = Field(default=None, primary_key=True)
    filename: str = Field(sa_column=Column(String(255)))
    filepath: str = Field(sa_column=Column(String(500)))
    submissionNote: Optional[str] = Field(default=None, sa_column=Column(Text))
    submitted_by: int = Field(sa_column=Column(Integer))
    subtask_id: int = Field(sa_column=Column(Integer))
    review_status: str = Field(default="PENDING", sa_column=Column(String(20)))
    review_comment: Optional[str] = Field(default=None, sa_column=Column(Text))
    reviewed_at: Optional[datetime] = Field(default=None, sa_column=Column(DateTime))
    submitted_at: Optional[datetime] = Field(default_factory=datetime.now, sa_column=Column(DateTime))

class SubmissionReviewAction(SQLModel):
    comment: Optional[str] = None

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    username: str = Field(unique=True, index=True)

class User(UserBase, table=True):
    __tablename__ = "user"
    id: Optional[int] = Field(default=None, primary_key=True)
    role: str = Field(sa_column=Column(String(50)))
    password: str
    created_at: Optional[datetime] = Field(default_factory=datetime.now, sa_column=Column(DateTime))

class UserCreate(UserBase):
    password: str
    role: str

class loginReq(SQLModel):
    email:str
    password_hash:str

class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional["UserOut"] = None

class UserOut(UserBase):
    id: int
    role: str

class Login(SQLModel):
    email: str
    password: str

class Project(SQLModel, table=True):
    __tablename__ = "project"
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    leader: int 
    deadline: Optional[datetime] = Field(default=None, sa_column=Column(DateTime))
    created_at: Optional[datetime] = Field(default_factory=datetime.now, sa_column=Column(DateTime))


class ProjectMember(SQLModel, table=True):
    __tablename__ = "project_member"
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(sa_column=Column(Integer))
    user_id: int = Field(sa_column=Column(Integer))
    created_at: Optional[datetime] = Field(default_factory=datetime.now, sa_column=Column(DateTime))


class ProjectMemberCreate(SQLModel):
    user_id: int


class TeamPerf(SQLModel):
    user_name: str 
    task_count: int 
    weight_percentage: float 
    status: list[dict[str, str]]
