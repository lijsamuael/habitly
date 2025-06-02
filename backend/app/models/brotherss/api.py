from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from typing import List
from .model import Brotherss
from app.db import get_session

router = APIRouter(
    prefix="/brotherss",
    tags=["Brotherss"]
)

@router.post("/", response_model=Brotherss)
async def create_brotherss(brotherss: Brotherss, db: Session = Depends(get_session)):
    db.add(brotherss)
    db.commit()
    db.refresh(brotherss)
    return brotherss

@router.get("/", response_model=List[Brotherss])
async def read_brothersss(db: Session = Depends(get_session)):
    brothersss = db.exec(select(Brotherss)).all()
    return brothersss

@router.get("/{item_id}", response_model=Brotherss)
async def read_brotherss(item_id: int, db: Session = Depends(get_session)):
    brotherss = db.get(Brotherss, item_id)
    if not brotherss:
        raise HTTPException(status_code=404, detail="Item not found")
    return brotherss

@router.put("/{item_id}", response_model=Brotherss)
async def update_brotherss(item_id: int, brotherss: Brotherss, db: Session = Depends(get_session)):
    db_item = db.get(Brotherss, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    item_data = brotherss.dict(exclude_unset=True)
    for key, value in item_data.items():
        setattr(db_item, key, value)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
async def delete_brotherss(item_id: int, db: Session = Depends(get_session)):
    brotherss = db.get(Brotherss, item_id)
    if not brotherss:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(brotherss)
    db.commit()
    return {"message": "Item deleted successfully"}
