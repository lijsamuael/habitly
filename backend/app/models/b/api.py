from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from typing import List
from .model import B
from app.db import get_session

router = APIRouter(
    prefix="/b",
    tags=["B"]
)

@router.post("/", response_model=B)
async def create_b(b: B, db: Session = Depends(get_session)):
    db.add(b)
    db.commit()
    db.refresh(b)
    return b

@router.get("/", response_model=List[B])
async def read_bs(db: Session = Depends(get_session)):
    bs = db.exec(select(B)).all()
    return bs

@router.get("/{item_id}", response_model=B)
async def read_b(item_id: int, db: Session = Depends(get_session)):
    b = db.get(B, item_id)
    if not b:
        raise HTTPException(status_code=404, detail="Item not found")
    return b

@router.put("/{item_id}", response_model=B)
async def update_b(item_id: int, b: B, db: Session = Depends(get_session)):
    db_item = db.get(B, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    item_data = b.dict(exclude_unset=True)
    for key, value in item_data.items():
        setattr(db_item, key, value)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
async def delete_b(item_id: int, db: Session = Depends(get_session)):
    b = db.get(B, item_id)
    if not b:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(b)
    db.commit()
    return {"message": "Item deleted successfully"}
