from typing import Generic, Type, TypeVar, List, Dict, Any
from fastapi import HTTPException
from sqlmodel import SQLModel, Session, select

ModelType = TypeVar("ModelType", bound=SQLModel)

class CRUDBase(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get(self, db: Session, id: int) -> ModelType:
        obj = db.get(self.model, id)
        if not obj:
            raise HTTPException(status_code=404, detail=f"{self.model.__name__} not found")
        return obj

    def get_all(self, db: Session) -> List[ModelType]:
        try:
            return db.exec(select(self.model)).all()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def create(self, db: Session, obj_in: ModelType) -> ModelType:
        try:
            db.add(obj_in)
            db.commit()
            db.refresh(obj_in)
            return obj_in
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Error creating {self.model.__name__}: {str(e)}")

    def update(self, db: Session, id: int, obj_in: Dict[str, Any]) -> ModelType:
        obj_db = self.get(db, id)
        try:
            for key, value in obj_in.items():
                setattr(obj_db, key, value)
            db.commit()
            db.refresh(obj_db)
            return obj_db
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Error updating {self.model.__name__}: {str(e)}")

    def delete(self, db: Session, id: int) -> dict:
        obj = self.get(db, id)
        try:
            db.delete(obj)
            db.commit()
            return {"message": f"{self.model.__name__} deleted successfully"}
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Error deleting {self.model.__name__}: {str(e)}")
