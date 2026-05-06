from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from auth import get_current_user
from models import UserOut, User
from database import get_session

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/", response_model=list[UserOut])
def get_all_users(session: Session = Depends(get_session)):
    """Get all users"""
    users = session.exec(select(User)).all()
    return users

@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, session: Session = Depends(get_session)):
    """Get one user by id"""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}/role")
def update_user_role(user_id: int, role: str, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    """Update user role (only team leaders can do this)"""
    if current_user.role not in ["team_leader", "leader"]:
        raise HTTPException(status_code=403, detail="Only team leaders can update user roles")
    
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    valid_roles = ["team_member", "team_leader"]
    if role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}")
    
    user.role = role
    session.add(user)
    session.commit()
    session.refresh(user)
    return UserOut(id=user.id, email=user.email, username=user.username, role=user.role)

@router.delete("/{user_id}")
def remove_user(user_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    """Remove a user (only team leaders can do this)"""
    if current_user.role not in ["team_leader", "leader"]:
        raise HTTPException(status_code=403, detail="Only team leaders can remove users")
    
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot remove yourself")
    
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    session.delete(user)
    session.commit()
    return {"message": "User removed successfully"}
