from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from typing import List
from .model import Sami
from app.db import get_session

router = APIRouter(
    prefix="/sami",
    tags=["Sami"]
)

@router.post("/", response_model=Sami)
async def create_sami(sami: Sami, db: Session = Depends(get_session)):
    db.add(sami)
    db.commit()
    db.refresh(sami)
    return sami

@router.get("/", response_model=List[Sami])
async def read_samis(db: Session = Depends(get_session)):
    samis = db.exec(select(Sami)).all()
    return samis

@router.get("/{item_id}", response_model=Sami)
async def read_sami(item_id: int, db: Session = Depends(get_session)):
    sami = db.get(Sami, item_id)
    if not sami:
        raise HTTPException(status_code=404, detail="Item not found")
    return sami

@router.put("/{item_id}", response_model=Sami)
async def update_sami(item_id: int, sami: Sami, db: Session = Depends(get_session)):
    db_item = db.get(Sami, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    item_data = sami.dict(exclude_unset=True)
    for key, value in item_data.items():
        setattr(db_item, key, value)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
async def delete_sami(item_id: int, db: Session = Depends(get_session)):
    sami = db.get(Sami, item_id)
    if not sami:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(sami)
    db.commit()
    return {"message": "Item deleted successfully"}
