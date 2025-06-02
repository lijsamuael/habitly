from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from typing import List
from .model import Brothers
from app.db import get_session

router = APIRouter(
    prefix="/brothers",
    tags=["Brothers"]
)

@router.post("/", response_model=Brothers)
async def create_brothers(brothers: Brothers, db: Session = Depends(get_session)):
    db.add(brothers)
    db.commit()
    db.refresh(brothers)
    return brothers

@router.get("/", response_model=List[Brothers])
async def read_brotherss(db: Session = Depends(get_session)):
    brotherss = db.exec(select(Brothers)).all()
    return brotherss

@router.get("/{item_id}", response_model=Brothers)
async def read_brothers(item_id: int, db: Session = Depends(get_session)):
    brothers = db.get(Brothers, item_id)
    if not brothers:
        raise HTTPException(status_code=404, detail="Item not found")
    return brothers

@router.put("/{item_id}", response_model=Brothers)
async def update_brothers(item_id: int, brothers: Brothers, db: Session = Depends(get_session)):
    db_item = db.get(Brothers, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    item_data = brothers.dict(exclude_unset=True)
    for key, value in item_data.items():
        setattr(db_item, key, value)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
async def delete_brothers(item_id: int, db: Session = Depends(get_session)):
    brothers = db.get(Brothers, item_id)
    if not brothers:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(brothers)
    db.commit()
    return {"message": "Item deleted successfully"}
