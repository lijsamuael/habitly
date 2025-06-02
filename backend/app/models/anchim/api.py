from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from typing import List
from .model import Anchim
from app.db import get_session

router = APIRouter(
    prefix="/anchim",
    tags=["Anchim"]
)

@router.post("/", response_model=Anchim)
async def create_anchim(anchim: Anchim, db: Session = Depends(get_session)):
    db.add(anchim)
    db.commit()
    db.refresh(anchim)
    return anchim

@router.get("/", response_model=List[Anchim])
async def read_anchims(db: Session = Depends(get_session)):
    anchims = db.exec(select(Anchim)).all()
    return anchims

@router.get("/{item_id}", response_model=Anchim)
async def read_anchim(item_id: int, db: Session = Depends(get_session)):
    anchim = db.get(Anchim, item_id)
    if not anchim:
        raise HTTPException(status_code=404, detail="Item not found")
    return anchim

@router.put("/{item_id}", response_model=Anchim)
async def update_anchim(item_id: int, anchim: Anchim, db: Session = Depends(get_session)):
    db_item = db.get(Anchim, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    item_data = anchim.dict(exclude_unset=True)
    for key, value in item_data.items():
        setattr(db_item, key, value)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
async def delete_anchim(item_id: int, db: Session = Depends(get_session)):
    anchim = db.get(Anchim, item_id)
    if not anchim:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(anchim)
    db.commit()
    return {"message": "Item deleted successfully"}
