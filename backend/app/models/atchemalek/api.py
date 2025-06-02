from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from typing import List
from .model import Atchemalek
from app.db import get_session

router = APIRouter(
    prefix="/atchemalek",
    tags=["Atchemalek"]
)

@router.post("/", response_model=Atchemalek)
async def create_atchemalek(atchemalek: Atchemalek, db: Session = Depends(get_session)):
    db.add(atchemalek)
    db.commit()
    db.refresh(atchemalek)
    return atchemalek

@router.get("/", response_model=List[Atchemalek])
async def read_atchemaleks(db: Session = Depends(get_session)):
    atchemaleks = db.exec(select(Atchemalek)).all()
    return atchemaleks

@router.get("/{item_id}", response_model=Atchemalek)
async def read_atchemalek(item_id: int, db: Session = Depends(get_session)):
    atchemalek = db.get(Atchemalek, item_id)
    if not atchemalek:
        raise HTTPException(status_code=404, detail="Item not found")
    return atchemalek

@router.put("/{item_id}", response_model=Atchemalek)
async def update_atchemalek(item_id: int, atchemalek: Atchemalek, db: Session = Depends(get_session)):
    db_item = db.get(Atchemalek, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    item_data = atchemalek.dict(exclude_unset=True)
    for key, value in item_data.items():
        setattr(db_item, key, value)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
async def delete_atchemalek(item_id: int, db: Session = Depends(get_session)):
    atchemalek = db.get(Atchemalek, item_id)
    if not atchemalek:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(atchemalek)
    db.commit()
    return {"message": "Item deleted successfully"}
