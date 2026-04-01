from sqlmodel import Column, SQLModel, Field, String, Text,Integer,Float
from typing import Optional
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
    
    
