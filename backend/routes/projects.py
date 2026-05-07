from fastapi import APIRouter, Depends, HTTPException

from sqlmodel import Session, select

from database import get_session

from models import Project, ProjectMember, ProjectMemberCreate, User, TaskByAi, SubTaskByAi, AIStructureRequest
import traceback
from auth import get_current_user
from aiService import generate_project_structure
import logging
from aiService import import_tasks_from_json

logger = logging.getLogger(__name__)



router = APIRouter(prefix="/projects", tags=["Projects"])

def normalize_role(role: str) -> str:
    return str(role or "").strip().lower().replace(" ", "_")



@router.post("/", response_model=Project)

def create_project(project: Project, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Only team leaders can create projects
    if normalize_role(current_user.role) not in ["team_leader", "leader"]:
        raise HTTPException(status_code=403, detail="Only team leaders can create projects")
    
    # Set the project leader to the current user
    project.leader = current_user.id
    
    session.add(project)

    session.commit()

    session.refresh(project)

    return project



@router.get("/", response_model=list[Project])

def get_projects(session: Session = Depends(get_session)):

    return session.exec(select(Project)).all()


@router.get("/members/", response_model=list[ProjectMember])
def get_project_members(session: Session = Depends(get_session)):
    return session.exec(select(ProjectMember)).all()


@router.get("/{project_id}/members", response_model=list[ProjectMember])
def get_members_for_project(project_id: int, session: Session = Depends(get_session)):
    project = session.get(Project, project_id)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return session.exec(select(ProjectMember).where(ProjectMember.project_id == project_id)).all()


@router.post("/{project_id}/members", response_model=ProjectMember)
def add_project_member(
    project_id: int,
    member: ProjectMemberCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if normalize_role(current_user.role) not in ["team_leader", "leader"]:
        raise HTTPException(status_code=403, detail="Only team leaders can add project members")

    project = session.get(Project, project_id)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.leader != current_user.id:
        raise HTTPException(status_code=403, detail="You can only add members to your own projects")

    user = session.get(User, member.user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if normalize_role(user.role) not in ["team_member", "member"]:
        raise HTTPException(status_code=400, detail="Only team members can be added to projects")

    existing_member = session.exec(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == member.user_id,
        )
    ).first()

    if existing_member:
        return existing_member

    project_member = ProjectMember(project_id=project_id, user_id=member.user_id)
    session.add(project_member)
    session.commit()
    session.refresh(project_member)

    return project_member



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

    project.deadline = updated.deadline

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

@router.post("/generate-structure")
async def generate_structure(request: AIStructureRequest, current_user: User = Depends(get_current_user)):
    try:
        raw_structure = generate_project_structure(
            title=request.title,
            description=request.description
        )
        tasks = import_tasks_from_json(raw_structure)
        
        return {
            "success": True,
            "structure": {
                "tasks": tasks
            }
        }
    except Exception as e:
        logger.error(f"AI generation failed: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")