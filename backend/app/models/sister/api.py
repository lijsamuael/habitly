from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from typing import List
from .model import Sister
from app.db import get_session

router = APIRouter(
    prefix="/sister",
    tags=["Sister"]
)

@router.post("/", response_model=Sister)
async def create_sister(sister: Sister, db: Session = Depends(get_session)):
    db.add(sister)
    db.commit()
    db.refresh(sister)
    return sister

@router.get("/", response_model=List[Sister])
async def read_sisters(db: Session = Depends(get_session)):
    sisters = db.exec(select(Sister)).all()
    return sisters

@router.get("/{item_id}", response_model=Sister)
async def read_sister(item_id: int, db: Session = Depends(get_session)):
    sister = db.get(Sister, item_id)
    if not sister:
        raise HTTPException(status_code=404, detail="Item not found")
    return sister

@router.put("/{item_id}", response_model=Sister)
async def update_sister(item_id: int, sister: Sister, db: Session = Depends(get_session)):
    db_item = db.get(Sister, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    item_data = sister.dict(exclude_unset=True)
    for key, value in item_data.items():
        setattr(db_item, key, value)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
async def delete_sister(item_id: int, db: Session = Depends(get_session)):
    sister = db.get(Sister, item_id)
    if not sister:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(sister)
    db.commit()
    return {"message": "Item deleted successfully"}
