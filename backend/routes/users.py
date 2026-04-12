from fastapi import APIRouter, Depends
from auth import get_current_user
from models import UserOut,Users

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserOut)
def get_me(current_user: Users = Depends(get_current_user)):
    return current_user