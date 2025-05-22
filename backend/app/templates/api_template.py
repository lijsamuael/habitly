from string import Template

def get_api_template(model_name: str, table_name: str) -> str:
    """Generate the API router code for a given model."""
    template = Template("""from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from typing import List
from .model import $model_name
from app.db import get_session

router = APIRouter(
    prefix="/$table_name",
    tags=["$model_name"]
)

@router.post("/", response_model=$model_name)
async def create_$table_name($table_name: $model_name, db: Session = Depends(get_session)):
    db.add($table_name)
    db.commit()
    db.refresh($table_name)
    return $table_name

@router.get("/", response_model=List[$model_name])
async def read_${table_name}s(db: Session = Depends(get_session)):
    ${table_name}s = db.exec(select($model_name)).all()
    return ${table_name}s

@router.get("/{item_id}", response_model=$model_name)
async def read_$table_name(item_id: int, db: Session = Depends(get_session)):
    $table_name = db.get($model_name, item_id)
    if not $table_name:
        raise HTTPException(status_code=404, detail="Item not found")
    return $table_name

@router.put("/{item_id}", response_model=$model_name)
async def update_$table_name(item_id: int, $table_name: $model_name, db: Session = Depends(get_session)):
    db_item = db.get($model_name, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    item_data = $table_name.dict(exclude_unset=True)
    for key, value in item_data.items():
        setattr(db_item, key, value)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
async def delete_$table_name(item_id: int, db: Session = Depends(get_session)):
    $table_name = db.get($model_name, item_id)
    if not $table_name:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete($table_name)
    db.commit()
    return {"message": "Item deleted successfully"}
""")
    return template.substitute(model_name=model_name, table_name=table_name)