from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from typing import List
from .model import string
from app.db import get_session

router = APIRouter(
    prefix="/string",
    tags=["string"]
)

@router.post("/", response_model=string)
async def create_string(string: string, db: Session = Depends(get_session)):
    db.add(string)
    db.commit()
    db.refresh(string)
    return string

@router.get("/", response_model=List[string])
async def read_strings(db: Session = Depends(get_session)):
    strings = db.exec(select(string)).all()
    return strings

@router.get("/{item_id}", response_model=string)
async def read_string(item_id: int, db: Session = Depends(get_session)):
    string = db.get(string, item_id)
    if not string:
        raise HTTPException(status_code=404, detail="Item not found")
    return string

@router.put("/{item_id}", response_model=string)
async def update_string(item_id: int, string: string, db: Session = Depends(get_session)):
    db_item = db.get(string, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    item_data = string.dict(exclude_unset=True)
    for key, value in item_data.items():
        setattr(db_item, key, value)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
async def delete_string(item_id: int, db: Session = Depends(get_session)):
    string = db.get(string, item_id)
    if not string:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(string)
    db.commit()
    return {"message": "Item deleted successfully"}
