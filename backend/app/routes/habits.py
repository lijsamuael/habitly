from typing import Annotated
from fastapi import Depends, APIRouter
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session
from app.schemas import Habit
from app.db import get_session
from app.crud import CRUDBase

habit_crud = CRUDBase(Habit)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


router = APIRouter(prefix="/habits", tags=["habits"])

@router.get("/{habit_id}")
def get_habit(token: Annotated[str, Depends(oauth2_scheme)], habit_id: int, db: Session = Depends(get_session)):
    return habit_crud.get(db, habit_id)

@router.get("/")
def get_all_habits(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_session)):
    return habit_crud.get_all(db)

@router.post("/")
def create_habit(token: Annotated[str, Depends(oauth2_scheme)], habit: Habit, db: Session = Depends(get_session)):
    return habit_crud.create(db, habit)

@router.put("/{habit_id}")
def update_habit(token: Annotated[str, Depends(oauth2_scheme)], habit_id: int, habit: dict, db: Session = Depends(get_session)):
    return habit_crud.update(db, habit_id, habit)

@router.delete("/{habit_id}")
def delete_habit(token: Annotated[str, Depends(oauth2_scheme)], habit_id: int, db: Session = Depends(get_session)):
    return habit_crud.delete(db, habit_id)