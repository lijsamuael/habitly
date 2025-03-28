from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import session
from sqlmodel import Session
from sqlmodel import select
from app.db import SessionDep
from app.crud import CRUDBase
from app.models import Habit, Streak
from fastapi.security import OAuth2PasswordBearer

from app.utils import update_streak

streak_crud = CRUDBase(Streak)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


router = APIRouter(prefix="/streaks", tags=["streaks"])

@router.get("/{streak_id}")
def get_streak(streak_id: int, db: SessionDep):
    return streak_crud.get(db, streak_id)

@router.get("/")
def get_all_streaks(db: SessionDep):
    return streak_crud.get_all(db)

@router.post("/")
def create_streak(streak: Streak, db: SessionDep):
    habit = db.get(Habit, streak.habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return update_streak(habit, db)



@router.delete("/{streak_id}")
def delete_streak(streak_id: int, db: SessionDep):
    return streak_crud.delete(db, streak_id)

