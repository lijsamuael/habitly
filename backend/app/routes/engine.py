import os
import re
import logging
import sys
import datetime
from typing import Dict, List, Optional, Type, Generator
from fastapi import FastAPI, APIRouter, HTTPException, Depends
from sqlmodel import SQLModel, Field, Session, select, create_engine
from app.schemas import ModelDefinition
from app.templates.api_template import get_api_template
from importlib import import_module

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Saad(FastAPI):
    def __init__(self, *args, db_url: str = f"postgresql+psycopg://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:{os.getenv('POSTGRES_PORT')}/{os.getenv('POSTGRES_DB')}", **kwargs):
        super().__init__(*args, **kwargs)
        self.engine = create_engine(db_url)
        self.dynamic_models: Dict[str, Type[SQLModel]] = {}
        # Ensure app/models/ is a package
        os.makedirs("app/models", exist_ok=True)
        init_file = "app/models/__init__.py"
        if not os.path.exists(init_file):
            with open(init_file, "w") as f:
                f.write("")
        # Include existing dynamic routers at startup
        self.include_dynamic_routers()

    def get_db(self) -> Generator[Session, None, None]:
        with Session(self.engine) as session:
            yield session

    def include_dynamic_routers(self):
        """Include routers for existing models at startup."""
        models_dir = "app/models"
        if not os.path.exists(models_dir):
            logger.warning(f"Models directory {models_dir} does not exist")
            return
        for model_folder in os.listdir(models_dir):
            model_path = os.path.join(models_dir, model_folder)
            if os.path.isdir(model_path) and os.path.exists(os.path.join(model_path, "__init__.py")):
                module_name = f"app.models.{model_folder}.api"
                try:
                    if module_name in sys.modules:
                        del sys.modules[module_name]
                    router_module = import_module(module_name)
                    self.include_router(router_module.router)
                    logger.info(f"Successfully included router for {model_folder}")
                except ImportError as e:
                    logger.warning(f"Failed to include router for {model_folder}: {str(e)}")

    def create_dynamic_model(self, model_def: ModelDefinition) -> Type[SQLModel]:
        """Dynamically create an SQLModel class from the model definition"""
        attrs = {"__annotations__": {}}
        
        # Ensure id field is included if not provided
        has_id_field = any(field.name.lower() == "id" for field in model_def.fields)
        if not has_id_field:
            attrs["__annotations__"]["id"] = int
            attrs["id"] = Field(default=None, primary_key=True)
        
        for field_def in model_def.fields:
            field_name = field_def.name.replace(" ", "_")
            field_type = {
                "str": str,
                "int": int,
                "float": float,
                "bool": bool,
                "datetime": datetime.datetime
            }[field_def.type.lower()]
            
            if not field_def.required:
                field_type = Optional[field_type]
            
            attrs["__annotations__"][field_name] = field_type
            field_params = {}
            if field_def.primary_key:
                field_params["primary_key"] = True
            if field_def.default is not None:
                if field_def.type.lower() == "int":
                    field_params["default"] = int(field_def.default)
                elif field_def.type.lower() == "float":
                    field_params["default"] = float(field_def.default)
                elif field_def.type.lower() == "bool":
                    field_params["default"] = field_def.default.lower() == "true"
                else:
                    field_params["default"] = field_def.default
            
            if field_def.foreign_key:
                related_model, related_field = field_def.foreign_key.split(".")
                attrs[field_name] = Field(
                    foreign_key=f"{related_model.lower()}.{related_field}", 
                    **field_params
                )
            else:
                attrs[field_name] = Field(**field_params)
        
        model_class = type(model_def.name, (SQLModel,), attrs)
        return model_class

    def create_crud_router(self, model_class: Type[SQLModel]) -> APIRouter:
        """Generate CRUD endpoints for a given model class"""
        router = APIRouter(
            prefix=f"/{model_class.__tablename__}",
            tags=[model_class.__name__]
        )
        
        @router.post("/", response_model=model_class)
        async def create_item(item: model_class, db: Session = Depends(self.get_db)):
            db.add(item)
            db.commit()
            db.refresh(item)
            return item
        
        @router.get("/", response_model=List[model_class])
        async def read_items(db: Session = Depends(self.get_db)):
            items = db.exec(select(model_class)).all()
            return items
        
        @router.get("/{item_id}", response_model=model_class)
        async def read_item(item_id: int, db: Session = Depends(self.get_db)):
            item = db.get(model_class, item_id)
            if not item:
                raise HTTPException(status_code=404, detail="Item not found")
            return item
        
        @router.put("/{item_id}", response_model=model_class)
        async def update_item(item_id: int, item: model_class, db: Session = Depends(self.get_db)):
            db_item = db.get(model_class, item_id)
            if not db_item:
                raise HTTPException(status_code=404, detail="Item not found")
            item_data = item.dict(exclude_unset=True)
            for key, value in item_data.items():
                setattr(db_item, key, value)
            db.add(db_item)
            db.commit()
            db.refresh(db_item)
            return db_item
        
        @router.delete("/{item_id}")
        async def delete_item(item_id: int, db: Session = Depends(self.get_db)):
            item = db.get(model_class, item_id)
            if not item:
                raise HTTPException(status_code=404, detail="Item not found")
            db.delete(item)
            db.commit()
            return {"message": "Item deleted successfully"}
        
        return router

    def generate_model_file(self, model_def: ModelDefinition, model_class: Type[SQLModel]) -> str:
        """Generate the content for model.py"""
        model_name = model_def.name
        fields = []
        
        # Include id field if not in model_def.fields
        has_id_field = any(field.name.lower() == "id" for field in model_def.fields)
        if not has_id_field:
            fields.append("    id: int = Field(default=None, primary_key=True)")
        
        for field_def in model_def.fields:
            field_name = field_def.name.replace(" ", "_")
            field_type = field_def.type.lower()
            python_type = {
                "str": "str",
                "int": "int",
                "float": "float",
                "bool": "bool",
                "datetime": "datetime.datetime"
            }[field_type]
            
            if not field_def.required:
                python_type = f"Optional[{python_type}]"
            
            field_params = []
            if field_def.primary_key:
                field_params.append("primary_key=True")
            if field_def.default is not None:
                if field_type == "bool":
                    default_value = "True" if field_def.default.lower() == "true" else "False"
                elif field_type in ["int", "float"]:
                    default_value = field_def.default
                else:
                    default_value = f'"{field_def.default}"'
                field_params.append(f"default={default_value}")
            if field_def.foreign_key:
                field_params.append(f'foreign_key="{field_def.foreign_key}"')
            
            field_line = f"    {field_name}: {python_type} = Field("
            if field_params:
                field_line += ", ".join(field_params)
            field_line += ")"
            fields.append(field_line)
        
        model_content = f"""from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class {model_name}(SQLModel, table=True):
{chr(10).join(fields)}
"""
        return model_content

    def define_model(self, model_def: ModelDefinition):
        """Endpoint to define new models and generate files"""
        if not re.match(r"^[A-Za-z][A-Za-z0-9_]*$", model_def.name):
            raise HTTPException(status_code=400, detail="Model name must start with a letter and contain only letters, numbers, or underscores")
        
        if model_def.name in self.dynamic_models:
            raise HTTPException(status_code=400, detail="Model already exists")
        
        # Create the model class
        model_class = self.create_dynamic_model(model_def)
        self.dynamic_models[model_def.name] = model_class
        
        # Create database table
        model_class.metadata.create_all(self.engine)
        
        # Generate CRUD endpoints
        router = self.create_crud_router(model_class)
        self.include_router(router)
        
        # Create folder and files
        model_folder = f"app/models/{model_def.name.lower().replace(' ', '_')}"
        logger.info(f"Creating folder: {model_folder}")
        os.makedirs(model_folder, exist_ok=True)
        
        # Ensure app/models/<model_name>/ is a package
        init_file = f"{model_folder}/__init__.py"
        if not os.path.exists(init_file):
            logger.info(f"Creating __init__.py in: {init_file}")
            with open(init_file, "w") as f:
                f.write("")
        
        # Generate and write model.py
        model_content = self.generate_model_file(model_def, model_class)
        model_file_path = f"{model_folder}/model.py"
        logger.info(f"Writing model file: {model_file_path}")
        with open(model_file_path, "w") as f:
            f.write(model_content)
        
        # Generate and write api.py using the template
        api_content = get_api_template(model_class.__name__, model_class.__tablename__)
        api_file_path = f"{model_folder}/api.py"
        logger.info(f"Writing api file: {api_file_path}")
        with open(api_file_path, "w") as f:
            f.write(api_content)
        
        # Dynamically include the generated router
        module_name = f"app.models.{model_def.name.lower().replace(' ', '_')}.api"
        logger.info(f"Attempting to import router: {module_name}")
        try:
            if module_name in sys.modules:
                del sys.modules[module_name]
            router_module = import_module(module_name)
            self.include_router(router_module.router)
            logger.info(f"Successfully included router for {model_def.name}")
        except ImportError as e:
            logger.error(f"Failed to import router for {model_def.name}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to include router for {model_def.name}: {str(e)}")
        
        return {
            "message": f"Model {model_def.name} created successfully",
            "endpoints": f"/{model_class.__tablename__}",
            "files_created": [
                model_file_path,
                api_file_path
            ]
        }