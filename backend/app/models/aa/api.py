from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from typing import List
from .model import Aa
from app.db import get_session

router = APIRouter(
    prefix="/aa",
    tags=["Aa"]
)

@router.post("/", response_model=Aa)
async def create_aa(aa: Aa, db: Session = Depends(get_session)):
    db.add(aa)
    db.commit()
    db.refresh(aa)
    return aa

@router.get("/", response_model=List[Aa])
async def read_aas(db: Session = Depends(get_session)):
    aas = db.exec(select(Aa)).all()
    return aas

@router.get("/{item_id}", response_model=Aa)
async def read_aa(item_id: int, db: Session = Depends(get_session)):
    aa = db.get(Aa, item_id)
    if not aa:
        raise HTTPException(status_code=404, detail="Item not found")
    return aa

@router.put("/{item_id}", response_model=Aa)
async def update_aa(item_id: int, aa: Aa, db: Session = Depends(get_session)):
    db_item = db.get(Aa, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    item_data = aa.dict(exclude_unset=True)
    for key, value in item_data.items():
        setattr(db_item, key, value)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
async def delete_aa(item_id: int, db: Session = Depends(get_session)):
    aa = db.get(Aa, item_id)
    if not aa:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(aa)
    db.commit()
    return {"message": "Item deleted successfully"}
