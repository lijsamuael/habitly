from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from typing import List
from .model import Lemi
from app.db import get_session

router = APIRouter(
    prefix="/lemi",
    tags=["Lemi"]
)

@router.post("/", response_model=Lemi)
async def create_lemi(lemi: Lemi, db: Session = Depends(get_session)):
    db.add(lemi)
    db.commit()
    db.refresh(lemi)
    return lemi

@router.get("/", response_model=List[Lemi])
async def read_lemis(db: Session = Depends(get_session)):
    lemis = db.exec(select(Lemi)).all()
    return lemis

@router.get("/{item_id}", response_model=Lemi)
async def read_lemi(item_id: int, db: Session = Depends(get_session)):
    lemi = db.get(Lemi, item_id)
    if not lemi:
        raise HTTPException(status_code=404, detail="Item not found")
    return lemi

@router.put("/{item_id}", response_model=Lemi)
async def update_lemi(item_id: int, lemi: Lemi, db: Session = Depends(get_session)):
    db_item = db.get(Lemi, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    item_data = lemi.dict(exclude_unset=True)
    for key, value in item_data.items():
        setattr(db_item, key, value)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
async def delete_lemi(item_id: int, db: Session = Depends(get_session)):
    lemi = db.get(Lemi, item_id)
    if not lemi:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(lemi)
    db.commit()
    return {"message": "Item deleted successfully"}
