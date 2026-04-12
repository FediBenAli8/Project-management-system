from fastapi import APIRouter, Depends
from models import Tasks,Subtasks
from database import get_session
from sqlmodel import Session,select
router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("/project")
def get_project(session:Session=Depends(get_session)):
    statement = select(Tasks)
    result = session.exec(statement).all()
    return result

@router.get("/project/subtasks")
def get_subtasks(session:Session=Depends(get_session)):
    statement = select(Subtasks)
    result = session.exec(statement).all()
    return result
