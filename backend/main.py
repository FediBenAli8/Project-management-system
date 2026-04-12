from fastapi import FastAPI, Depends
from database import get_session
from sqlmodel import SQLModel, Session,select
#from models import Tasks,Subtasks
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, users,tasks

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200","http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tasks.router)