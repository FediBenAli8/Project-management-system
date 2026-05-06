from fastapi import APIRouter, Depends

from sqlmodel import Session, select

from database import get_session

from models import Subtasks,TeamPerf,User

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/subtasks")
def get_subtasks(session: Session = Depends(get_session)):
    return session.exec(select(Subtasks)).all()
@router.get("/teamPerf")
def get_team_performance(session: Session = Depends(get_session)):
    stmt = (
        select(
            User.id,
            User.username,
            Subtasks.title,
            Subtasks.status,
            Subtasks.weight_percentage,
        )
        .join(User, User.id == Subtasks.assigned_to)
    )

    rows = session.exec(stmt).all()
    users: dict[int, dict] = {}

    for user_id, username, title, status, weight_percentage in rows:
        if user_id not in users:
            users[user_id] = {
                "user_name": username,
                "task_count": 0,
                "weight_percentage": 0,
                "status": [],
            }

        users[user_id]["task_count"] += 1
        users[user_id]["weight_percentage"] += weight_percentage or 0
        users[user_id]["status"].append({"title": title, "status": status})

    return [TeamPerf(**user_data) for user_data in users.values()]
