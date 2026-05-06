from sqlmodel import Session, create_engine, select
from models import Project

DATABASE_URL = "mysql+pymysql://root:@localhost:3306/projectmangement"
engine = create_engine(DATABASE_URL)

with Session(engine) as session:
    statement = select(Project).order_by(Project.id.desc()).limit(1)
    project = session.exec(statement).first()
    if project:
        print(f"Latest Project: ID={project.id}, Title={project.title}, Deadline={project.deadline}, Created At={project.created_at}")
    else:
        print("No projects found.")
