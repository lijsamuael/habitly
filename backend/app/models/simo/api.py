from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from typing import List
from .model import Simo
from app.db import get_session

router = APIRouter(
    prefix="/simo",
    tags=["Simo"]
)

@router.post("/", response_model=Simo)
async def create_simo(simo: Simo, db: Session = Depends(get_session)):
    db.add(simo)
    db.commit()
    db.refresh(simo)
    return simo

@router.get("/", response_model=List[Simo])
async def read_simos(db: Session = Depends(get_session)):
    simos = db.exec(select(Simo)).all()
    return simos

@router.get("/{item_id}", response_model=Simo)
async def read_simo(item_id: int, db: Session = Depends(get_session)):
    simo = db.get(Simo, item_id)
    if not simo:
        raise HTTPException(status_code=404, detail="Item not found")
    return simo

@router.put("/{item_id}", response_model=Simo)
async def update_simo(item_id: int, simo: Simo, db: Session = Depends(get_session)):
    db_item = db.get(Simo, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    item_data = simo.dict(exclude_unset=True)
    for key, value in item_data.items():
        setattr(db_item, key, value)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
async def delete_simo(item_id: int, db: Session = Depends(get_session)):
    simo = db.get(Simo, item_id)
    if not simo:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(simo)
    db.commit()
    return {"message": "Item deleted successfully"}
