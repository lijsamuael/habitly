from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from typing import List
from .model import Doctype
from app.db import get_session

router = APIRouter(
    prefix="/doctype",
    tags=["Doctype"]
)

@router.post("/", response_model=Doctype)
async def create_doctype(doctype: Doctype, db: Session = Depends(get_session)):
    db.add(doctype)
    db.commit()
    db.refresh(doctype)
    return doctype

@router.get("/", response_model=List[Doctype])
async def read_doctypes(db: Session = Depends(get_session)):
    doctypes = db.exec(select(Doctype)).all()
    return doctypes

@router.get("/{item_id}", response_model=Doctype)
async def read_doctype(item_id: int, db: Session = Depends(get_session)):
    doctype = db.get(Doctype, item_id)
    if not doctype:
        raise HTTPException(status_code=404, detail="Item not found")
    return doctype

@router.put("/{item_id}", response_model=Doctype)
async def update_doctype(item_id: int, doctype: Doctype, db: Session = Depends(get_session)):
    db_item = db.get(Doctype, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    item_data = doctype.dict(exclude_unset=True)
    for key, value in item_data.items():
        setattr(db_item, key, value)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
async def delete_doctype(item_id: int, db: Session = Depends(get_session)):
    doctype = db.get(Doctype, item_id)
    if not doctype:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(doctype)
    db.commit()
    return {"message": "Item deleted successfully"}
