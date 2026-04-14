from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import Project

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/", response_model=Project)
def create_project(project: Project, session: Session = Depends(get_session)):
    session.add(project)
    session.commit()
    session.refresh(project)
    return project

@router.get("/", response_model=list[Project])
def get_projects(session: Session = Depends(get_session)):
    return session.exec(select(Project)).all()

@router.get("/{project_id}", response_model=Project)
def get_project(project_id: int, session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/{project_id}", response_model=Project)
def update_project(project_id: int, updated: Project, session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project.title = updated.title
    project.description = updated.description
    project.leader = updated.leader
    session.commit()
    session.refresh(project)
    return project

@router.delete("/{project_id}")
def delete_project(project_id: int, session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    session.delete(project)
    session.commit()
    return {"message": "Project deleted successfully"}