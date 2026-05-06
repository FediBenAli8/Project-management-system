from pathlib import Path
from uuid import uuid4
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, Body, UploadFile
from fastapi.responses import FileResponse

from models import Project, Submission, SubmissionReviewAction, Subtasks, Tasks, User

from database import get_session

from sqlmodel import Session, select

from auth import get_current_user


router = APIRouter(prefix="/subtasks", tags=["subtasks"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads" / "submissions"
ALLOWED_EXTENSIONS = {".pdf", ".zip", ".png", ".jpg", ".jpeg", ".gif", ".webp"}



@router.post("/")

def create_subtask(subtask: Subtasks, session: Session = Depends(get_session)):

    session.add(subtask)

    session.commit()

    session.refresh(subtask)

    return subtask

@router.get("/user/{user_id}")
def get_subtasks_by_user(user_id: int, session: Session = Depends(get_session)):
    subtasks = session.exec(select(Subtasks).where(Subtasks.assigned_to == user_id)).all()
    return subtasks

@router.put("/{subtask_id}/status")
def update_subtask_status(subtask_id: int, status_data: dict = Body(...), session: Session = Depends(get_session)):
    subtask = session.get(Subtasks, subtask_id)
    if not subtask:
        raise HTTPException(status_code=404, detail="Subtask not found")
    subtask.status = status_data["status"]
    session.commit()
    session.refresh(subtask)
    return subtask


@router.post("/{subtask_id}/submit")
def submit_subtask(
    subtask_id: int,
    comment: str = Form(""),
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    subtask = session.get(Subtasks, subtask_id)

    if not subtask:
        raise HTTPException(status_code=404, detail="Subtask not found")

    if subtask.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="You can only submit your assigned subtasks")

    file_ext = Path(file.filename or "").suffix.lower()

    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Accepted files: PDF, ZIP, PNG, JPG, GIF, WEBP")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    stored_name = f"{subtask_id}_{uuid4().hex}{file_ext}"
    stored_path = UPLOAD_DIR / stored_name

    with stored_path.open("wb") as buffer:
        buffer.write(file.file.read())

    submission = Submission(
        filename=file.filename or stored_name,
        filepath=str(stored_path),
        submissionNote=comment,
        submitted_by=current_user.id,
        subtask_id=subtask.id,
        review_status="PENDING",
        review_comment=None,
        reviewed_at=None,
    )
    subtask.status = "pending_review"

    session.add(submission)
    session.commit()
    session.refresh(submission)
    session.refresh(subtask)

    return {
        "submission": submission,
        "subtask": subtask,
    }


@router.get("/leader/reviews")
def get_leader_reviews(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    rows = session.exec(
        select(Submission, Subtasks, Tasks, Project, User)
        .join(Subtasks, Subtasks.id == Submission.subtask_id)
        .join(Tasks, Tasks.id == Subtasks.task_id)
        .join(Project, Project.id == Tasks.project_id)
        .join(User, User.id == Submission.submitted_by)
        .where(Project.leader == current_user.id)
        .order_by(Submission.id.desc())
    ).all()

    def status_rank(status: str) -> int:
        return {"PENDING": 0, "REJECTED": 1, "APPROVED": 2}.get(str(status or "").upper(), 3)

    items = [
        {
            "submission_id": submission.id,
            "subtask_id": subtask.id,
            "subtask_title": subtask.title,
            "subtask_status": subtask.status,
            "task_id": task.id,
            "task_title": task.title,
            "project_id": project.id,
            "project_title": project.title,
            "member_id": member.id,
            "member_name": member.username,
            "filename": submission.filename,
            "submission_note": submission.submissionNote,
            "submitted_at": submission.submitted_at,
            "review_status": submission.review_status,
            "review_comment": submission.review_comment,
            "reviewed_at": submission.reviewed_at,
        }
        for submission, subtask, task, project, member in rows
    ]

    return sorted(items, key=lambda item: (status_rank(item["review_status"]), -int(item["submission_id"] or 0)))


@router.get("/submissions/{submission_id}/download")
def download_submission(
    submission_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    submission = session.get(Submission, submission_id)

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    subtask = session.get(Subtasks, submission.subtask_id)
    task = session.get(Tasks, subtask.task_id) if subtask else None
    project = session.get(Project, task.project_id) if task else None

    if not subtask or not task or not project:
        raise HTTPException(status_code=404, detail="Submission context not found")

    if project.leader != current_user.id and submission.submitted_by != current_user.id:
        raise HTTPException(status_code=403, detail="You cannot access this submission")

    path = Path(submission.filepath)

    if not path.exists():
        raise HTTPException(status_code=404, detail="Submitted file not found")

    return FileResponse(path, filename=submission.filename)


@router.patch("/submissions/{submission_id}/approve")
def approve_submission(
    submission_id: int,
    payload: SubmissionReviewAction = Body(default=SubmissionReviewAction()),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    submission, subtask = get_submission_for_leader(submission_id, session, current_user)
    submission.review_status = "APPROVED"
    submission.review_comment = payload.comment
    submission.reviewed_at = datetime.now()
    subtask.status = "done"
    session.commit()
    session.refresh(submission)
    session.refresh(subtask)
    return {"submission": submission, "subtask": subtask}


@router.patch("/submissions/{submission_id}/reject")
def reject_submission(
    submission_id: int,
    payload: SubmissionReviewAction,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    comment = str(payload.comment or "").strip()

    if not comment:
        raise HTTPException(status_code=400, detail="Comment is required when rejecting a submission")

    submission, subtask = get_submission_for_leader(submission_id, session, current_user)
    submission.review_status = "REJECTED"
    submission.review_comment = comment
    submission.reviewed_at = datetime.now()
    subtask.status = "rejected"
    session.commit()
    session.refresh(submission)
    session.refresh(subtask)
    return {"submission": submission, "subtask": subtask}


def get_submission_for_leader(
    submission_id: int,
    session: Session,
    current_user: User,
) -> tuple[Submission, Subtasks]:
    submission = session.get(Submission, submission_id)

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    subtask = session.get(Subtasks, submission.subtask_id)
    task = session.get(Tasks, subtask.task_id) if subtask else None
    project = session.get(Project, task.project_id) if task else None

    if not subtask or not task or not project:
        raise HTTPException(status_code=404, detail="Submission context not found")

    if project.leader != current_user.id:
        raise HTTPException(status_code=403, detail="You can only review submissions from your projects")

    return submission, subtask

@router.put("/{subtask_id}/assignee")
def update_subtask_assignee(subtask_id: int, assignee_data: dict = Body(...), session: Session = Depends(get_session)):
    subtask = session.get(Subtasks, subtask_id)
    if not subtask:
        raise HTTPException(status_code=404, detail="Subtask not found")
    subtask.assigned_to = assignee_data["assigned_to"]
    session.commit()
    session.refresh(subtask)
    return subtask
