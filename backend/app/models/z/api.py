from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from typing import List
from .model import z
from app.db import get_session

router = APIRouter(
    prefix="/z",
    tags=["z"]
)

@router.post("/", response_model=z)
async def create_z(z: z, db: Session = Depends(get_session)):
    db.add(z)
    db.commit()
    db.refresh(z)
    return z

@router.get("/", response_model=List[z])
async def read_zs(db: Session = Depends(get_session)):
    zs = db.exec(select(z)).all()
    return zs

@router.get("/{item_id}", response_model=z)
async def read_z(item_id: int, db: Session = Depends(get_session)):
    z = db.get(z, item_id)
    if not z:
        raise HTTPException(status_code=404, detail="Item not found")
    return z

@router.put("/{item_id}", response_model=z)
async def update_z(item_id: int, z: z, db: Session = Depends(get_session)):
    db_item = db.get(z, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    item_data = z.dict(exclude_unset=True)
    for key, value in item_data.items():
        setattr(db_item, key, value)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
async def delete_z(item_id: int, db: Session = Depends(get_session)):
    z = db.get(z, item_id)
    if not z:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(z)
    db.commit()
    return {"message": "Item deleted successfully"}
