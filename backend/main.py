from fastapi import FastAPI, Depends

from database import get_session, engine

from sqlalchemy import inspect, text

from sqlmodel import SQLModel, Session,select

                                  

from fastapi.middleware.cors import CORSMiddleware



from routes import auth, users,tasks,projects,subtask,report
import models



app = FastAPI()

def ensure_existing_schema_is_current():
    inspector = inspect(engine)
    project_columns = {column["name"] for column in inspector.get_columns("project")}

    if "deadline" not in project_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE project ADD COLUMN deadline DATETIME NULL"))

    if inspector.has_table("submission"):
        submission_columns = {column["name"] for column in inspector.get_columns("submission")}

        with engine.begin() as connection:
            if "review_status" not in submission_columns:
                connection.execute(text("ALTER TABLE submission ADD COLUMN review_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'"))

            if "review_comment" not in submission_columns:
                connection.execute(text("ALTER TABLE submission ADD COLUMN review_comment TEXT NULL"))

            if "reviewed_at" not in submission_columns:
                connection.execute(text("ALTER TABLE submission ADD COLUMN reviewed_at DATETIME NULL"))

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)
    ensure_existing_schema_is_current()

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

app.include_router(projects.router)
app.include_router(subtask.router)
app.include_router(report.router)
