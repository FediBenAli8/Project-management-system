from fastapi import APIRouter, Depends , HTTPException

from models import Tasks,Subtasks,User

from database import get_session

from sqlmodel import Session,select



router = APIRouter(prefix="/tasks", tags=["tasks"])



@router.get("/")

def get_project(session:Session=Depends(get_session)):

    statement = select(Tasks)

    result = session.exec(statement).all()

    return result



@router.get("/project/{project_id}")

def get_tasks_by_project(project_id: int, session:Session=Depends(get_session)):

    statement = select(Tasks).where(Tasks.project_id == project_id)

    result = session.exec(statement).all()

    return result



@router.get("/subtasks")

def get_subtasks(session:Session=Depends(get_session)):

    statement = select(Subtasks, User.username).join(User, User.id == Subtasks.assigned_to)

    result = session.exec(statement).all()

    return [
        {
            **subtask.dict(),
            "member_name": username,
            "assigned_to_name": username,
        }
        for subtask, username in result
    ]



@router.post("/")

def create_task(task:Tasks,session:Session=Depends(get_session)):

    session.add(task)

    session.commit()

    session.refresh(task)

    return task



@router.delete("/{task_id}")

def delete_task(task_id: int, session: Session = Depends(get_session)):

    task = session.get(Tasks, task_id)

    if not task:

        raise HTTPException(status_code=404, detail="Task not found")

    session.delete(task)

    session.commit()

    return {"message": "Task deleted successfully"}
