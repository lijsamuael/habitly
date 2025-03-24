from typing import Annotated
from fastapi import Depends, APIRouter
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session
from app.models import User
from app.db import SessionDep, get_session
from app.crud import CRUDBase

user_crud = CRUDBase(User)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")



router = APIRouter(prefix="/users", tags=["users"])

@router.get("/{user_id}")
def get_user(token: Annotated[str, Depends(oauth2_scheme)], user_id: int, db: SessionDep):
    return user_crud.get(db, user_id)

@router.get("/")
def get_all_users(token: Annotated[str, Depends(oauth2_scheme)], db: SessionDep):
    return user_crud.get_all(db)

@router.post("/")
def create_user(token: Annotated[str, Depends(oauth2_scheme)], user: User, db: SessionDep):
    return user_crud.create(db, user)

@router.put("/{user_id}")
def update_user(token: Annotated[str, Depends(oauth2_scheme)], user_id: int, user: dict, db: SessionDep):
    return user_crud.update(db, user_id, user)

@router.delete("/{user_id}")
def delete_user(token: Annotated[str, Depends(oauth2_scheme)], user_id: int, db: SessionDep):
    return user_crud.delete(db, user_id)
    