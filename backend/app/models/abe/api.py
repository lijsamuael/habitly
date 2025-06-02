from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from typing import List
from .model import abe
from app.db import get_session

router = APIRouter(
    prefix="/abe",
    tags=["abe"]
)

@router.post("/", response_model=abe)
async def create_abe(abe: abe, db: Session = Depends(get_session)):
    db.add(abe)
    db.commit()
    db.refresh(abe)
    return abe

@router.get("/", response_model=List[abe])
async def read_abes(db: Session = Depends(get_session)):
    abes = db.exec(select(abe)).all()
    return abes

@router.get("/{item_id}", response_model=abe)
async def read_abe(item_id: int, db: Session = Depends(get_session)):
    abe = db.get(abe, item_id)
    if not abe:
        raise HTTPException(status_code=404, detail="Item not found")
    return abe

@router.put("/{item_id}", response_model=abe)
async def update_abe(item_id: int, abe: abe, db: Session = Depends(get_session)):
    db_item = db.get(abe, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    item_data = abe.dict(exclude_unset=True)
    for key, value in item_data.items():
        setattr(db_item, key, value)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
async def delete_abe(item_id: int, db: Session = Depends(get_session)):
    abe = db.get(abe, item_id)
    if not abe:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(abe)
    db.commit()
    return {"message": "Item deleted successfully"}
