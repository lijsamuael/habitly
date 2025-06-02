from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from typing import List
from .model import Esua
from app.db import get_session

router = APIRouter(
    prefix="/esua",
    tags=["Esua"]
)

@router.post("/", response_model=Esua)
async def create_esua(esua: Esua, db: Session = Depends(get_session)):
    db.add(esua)
    db.commit()
    db.refresh(esua)
    return esua

@router.get("/", response_model=List[Esua])
async def read_esuas(db: Session = Depends(get_session)):
    esuas = db.exec(select(Esua)).all()
    return esuas

@router.get("/{item_id}", response_model=Esua)
async def read_esua(item_id: int, db: Session = Depends(get_session)):
    esua = db.get(Esua, item_id)
    if not esua:
        raise HTTPException(status_code=404, detail="Item not found")
    return esua

@router.put("/{item_id}", response_model=Esua)
async def update_esua(item_id: int, esua: Esua, db: Session = Depends(get_session)):
    db_item = db.get(Esua, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    item_data = esua.dict(exclude_unset=True)
    for key, value in item_data.items():
        setattr(db_item, key, value)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
async def delete_esua(item_id: int, db: Session = Depends(get_session)):
    esua = db.get(Esua, item_id)
    if not esua:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(esua)
    db.commit()
    return {"message": "Item deleted successfully"}
