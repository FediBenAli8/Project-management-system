from fastapi import FastAPI, Depends
from database import get_session
from sqlmodel import SQLModel, Session,select
from models import Tasks,Subtasks
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"  # Angular SSR server (if used)
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/project")
def read_project(session:Session=Depends(get_session)):
    statement = select(Tasks)
    result = session.exec(statement).all()
    return result
@app.get("/project/subtasks")
def read_subtasks(session:Session=Depends(get_session)):
    statement = select(Subtasks)
    result = session.exec(statement).all()
    return result