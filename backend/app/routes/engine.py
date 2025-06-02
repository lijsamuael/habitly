import os
import re
import logging
import sys
import datetime
import json
from typing import Dict, List, Optional, Type, Generator
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query
from sqlmodel import SQLModel, Field, Session, select, create_engine
from app.schemas import ModelDefinition
from app.templates.api_template import get_api_template
from importlib import import_module
from sqlalchemy import inspect, asc, desc
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import text

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Saad(FastAPI):
    def __init__(self, *args, db_url: str = f"postgresql+psycopg://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:{os.getenv('POSTGRES_PORT')}/{os.getenv('POSTGRES_DB')}", **kwargs):
        super().__init__(*args, **kwargs)
        self.engine = create_engine(db_url)
        self.dynamic_models: Dict[str, Type[SQLModel]] = {}
        print(f"Initializing Saad with database URL: {db_url}")
        # Ensure app/models/ is a package
        os.makedirs("app/models", exist_ok=True)
        init_file = "app/models/__init__.py"
        if not os.path.exists(init_file):
            print(f"Creating models package init file: {init_file}")
            with open(init_file, "w") as f:
                f.write("")
        # Include existing dynamic routers at startup
        print("Starting to include dynamic routers")
        self.include_dynamic_routers()

    def get_db(self) -> Generator[Session, None, None]:
        print("Creating new database session")
        with Session(self.engine) as session:
            yield session

    def include_dynamic_routers(self):
        """Include routers for existing models at startup."""
        models_dir = "app/models"
        print(f"Checking models directory: {models_dir}")
        if not os.path.exists(models_dir):
            logger.warning(f"Models directory {models_dir} does not exist")
            return
        for model_folder in os.listdir(models_dir):
            model_path = os.path.join(models_dir, model_folder)
            print(f"Processing model folder: {model_path}")
            if os.path.isdir(model_path) and os.path.exists(os.path.join(model_path, "__init__.py")):
                module_name = f"app.models.{model_folder}.api"
                try:
                    if module_name in sys.modules:
                        print(f"Removing cached module: {module_name}")
                        del sys.modules[module_name]
                    print(f"Importing router module: {module_name}")
                    router_module = import_module(module_name)
                    self.include_router(router_module.router)
                    logger.info(f"Successfully included router for {model_folder}")
                except ImportError as e:
                    logger.warning(f"Failed to include router for {model_folder}: {str(e)}")

    def create_dynamic_model(self, model_def: ModelDefinition) -> Type[SQLModel]:
        """Dynamically create an SQLModel class from the model definition"""
        print(f"Creating dynamic model for: {model_def.name}")
        attrs = {"__annotations__": {}}
        
        # Ensure id field is included if not provided
        has_id_field = any(field.name.lower() == "id" for field in model_def.fields)
        if not has_id_field:
            print("Adding default ID field")
            attrs["__annotations__"]["id"] = int
            attrs["id"] = Field(default=None, primary_key=True)
        
        for field_def in model_def.fields:
            field_name = field_def.name.replace(" ", "_")
            print(f"Processing field: {field_name}, type: {field_def.type}")
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
                print(f"Adding foreign key for field {field_name}: {field_def.foreign_key}")
                attrs[field_name] = Field(
                    foreign_key=f"{field_def.foreign_key.lower()}", 
                    **field_params
                )
            else:
                attrs[field_name] = Field(**field_params)
        
        model_class = type(model_def.name, (SQLModel,), attrs)
        print(f"Created model class: {model_class.__name__}")
        return model_class

    def parse_filter_param(self, filter_str: Optional[str]) -> Dict[str, str]:
        """Parse filter query parameter into a dictionary."""
        if not filter_str:
            return {}
        try:
            filter_dict = json.loads(filter_str)
            if not isinstance(filter_dict, dict):
                raise ValueError("Filter must be a valid JSON object")
            return {str(k): str(v) for k, v in filter_dict.items()}
        except json.JSONDecodeError:
            print(f"Invalid filter JSON: {filter_str}")
            raise HTTPException(status_code=400, detail="Invalid filter format. Must be a valid JSON object.")

    def create_crud_router(self, model_class: Type[SQLModel]) -> APIRouter:
        """Generate CRUD endpoints for a given model class"""
        print(f"Creating CRUD router for model: {model_class.__name__}")
        router = APIRouter(
            prefix=f"/{model_class.__tablename__}",
            tags=[model_class.__name__]
        )
        
        @router.post("/", response_model=model_class)
        async def create_item(item: model_class, db: Session = Depends(self.get_db)):
            print(f"Creating new item for {model_class.__name__}")
            db.add(item)
            db.commit()
            db.refresh(item)
            print(f"Created item with id: {getattr(item, 'id', 'N/A')}")
            return item
        
        @router.get("/", response_model=Dict)
        async def read_items(
            db: Session = Depends(self.get_db),
            page: int = Query(1, ge=1, description="Page number (1-based)"),
            page_size: int = Query(10, ge=1, le=100, description="Items per page"),
            sort_by: Optional[str] = Query(None, description="Field to sort by"),
            sort_order: str = Query("asc", regex="^(asc|desc)$", description="Sort order"),
            search: Optional[str] = Query(None, description="Search term for string fields"),
            filter: Optional[str] = Query(None, description="JSON string of field-value pairs for filtering, e.g., {\"name\": \"John\", \"age\": \"30\"}")
        ):
            print(f"Fetching items for {model_class.__name__} with page={page}, page_size={page_size}, sort_by={sort_by}, sort_order={sort_order}, search={search}, filter={filter}")
            
            # Start with base query
            query = select(model_class)
            
            # Apply filtering
            filter_dict = self.parse_filter_param(filter)
            if filter_dict:
                for key, value in filter_dict.items():
                    if hasattr(model_class, key):
                        print(f"Applying filter: {key}={value}")
                        query = query.where(getattr(model_class, key) == value)
                    else:
                        print(f"Invalid filter field: {key}")
                        raise HTTPException(status_code=400, detail=f"Invalid filter field: {key}")
            
            # Apply search (for string fields only)
            if search:
                print(f"Applying search term: {search}")
                search_conditions = []
                for field_name in model_class.__annotations__:
                    field_type = model_class.__annotations__[field_name]
                    # Handle Optional[str] and str
                    base_type = field_type.__args__[0] if hasattr(field_type, '__args__') else field_type
                    if base_type is str:
                        search_conditions.append(getattr(model_class, field_name).ilike(f"%{search}%"))
                if search_conditions:
                    from sqlalchemy import or_
                    query = query.where(or_(*search_conditions))
            
            # Apply sorting
            if sort_by and hasattr(model_class, sort_by):
                print(f"Applying sorting: {sort_by} {sort_order}")
                sort_func = asc if sort_order.lower() == "asc" else desc
                query = query.order_by(sort_func(getattr(model_class, sort_by)))
            
            # Apply pagination
            print(f"Applying pagination: page={page}, page_size={page_size}")
            offset = (page - 1) * page_size
            query = query.offset(offset).limit(page_size)
            
            # Execute query
            items = db.exec(query).all()
            print(f"Retrieved {len(items)} items")
            
            # Get total count for pagination metadata
            count_query = select(model_class)
            if filter_dict:
                for key, value in filter_dict.items():
                    if hasattr(model_class, key):
                        count_query = count_query.where(getattr(model_class, key) == value)
            if search:
                search_conditions = []
                for field_name in model_class.__annotations__:
                    field_type = model_class.__annotations__[field_name]
                    base_type = field_type.__args__[0] if hasattr(field_type, '__args__') else field_type
                    if base_type is str:
                        search_conditions.append(getattr(model_class, field_name).ilike(f"%{search}%"))
                if search_conditions:
                    from sqlalchemy import or_
                    count_query = count_query.where(or_(*search_conditions))
            total_items = db.exec(count_query).all()
            total_count = len(total_items)
            
            return {
                "items": items,
                "page": page,
                "page_size": page_size,
                "total_items": total_count,
                "total_pages": (total_count + page_size - 1) // page_size
            }
        
        @router.get("/{item_id}", response_model=model_class)
        async def read_item(item_id: int, db: Session = Depends(self.get_db)):
            print(f"Fetching item {item_id} for {model_class.__name__}")
            item = db.get(model_class, item_id)
            if not item:
                print(f"Item {item_id} not found")
                raise HTTPException(status_code=404, detail="Item not found")
            return item
        
        @router.put("/{item_id}", response_model=model_class)
        async def update_item(item_id: int, item: model_class, db: Session = Depends(self.get_db)):
            print(f"Updating item {item_id} for {model_class.__name__}")
            db_item = db.get(model_class, item_id)
            if not db_item:
                print(f"Item {item_id} not found for update")
                raise HTTPException(status_code=404, detail="Item not found")
            item_data = item.dict(exclude_unset=True)
            for key, value in item_data.items():
                setattr(db_item, key, value)
            db.add(db_item)
            db.commit()
            db.refresh(db_item)
            print(f"Updated item {item_id}")
            return db_item
        
        @router.delete("/{item_id}")
        async def delete_item(item_id: int, db: Session = Depends(self.get_db)):
            print(f"Deleting item {item_id} for {model_class.__name__}")
            item = db.get(model_class, item_id)
            if not item:
                print(f"Item {item_id} not found for deletion")
                raise HTTPException(status_code=404, detail="Item not found")
            db.delete(item)
            db.commit()
            print(f"Deleted item {item_id}")
            return {"message": "Item deleted successfully"}
        
        return router

    def generate_model_file(self, model_def: ModelDefinition, model_class: Type[SQLModel]) -> str:
        """Generate the content for model.py"""
        print(f"Generating model file for {model_def.name}")
        model_name = model_def.name
        fields = []
        
        has_id_field = any(field.name.lower() == "id" for field in model_def.fields)
        if not has_id_field:
            print("Adding default ID field to model file")
            fields.append("    id: int = Field(default=None, primary_key=True)")
        
        for field_def in model_def.fields:
            field_name = field_def.name.replace(" ", "_")
            print(f"Processing model field: {field_name}")
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
        print(f"Generated model content for {model_name}")
        return model_content

    def define_model(self, model_def: ModelDefinition):
        """Endpoint to define new models and generate files"""
        print(f"Defining new model: {model_def.name}")
        if not re.match(r"^[A-Za-z][A-Za-z0-9_]*$", model_def.name):
            print(f"Invalid model name: {model_def.name}")
            raise HTTPException(status_code=400, detail="Model name must start with a letter and contain only letters, numbers, or underscores")
        
        if model_def.name in self.dynamic_models:
            print(f"Model already exists: {model_def.name}")
            raise HTTPException(status_code=400, detail="Model already exists")
        
        # Create the model class
        model_class = self.create_dynamic_model(model_def)
        self.dynamic_models[model_def.name] = model_class
        print(f"Added to dynamic models: {self.dynamic_models.keys()}")

        # Create database table
        print(f"Creating database table for {model_def.name}")

        # First ensure the model is properly configured as a table
        if not hasattr(model_class, '__tablename__'):
            model_class.__tablename__ = model_def.name.lower()
            print(f"Set table name to: {model_class.__tablename__}")

        # Explicitly create the SQLAlchemy table
        from sqlalchemy import Table, Column
        from sqlalchemy.types import String, Integer, Boolean, DateTime, Float

        # Ensure ID field exists as primary key
        if not any(field.name.lower() == "id" for field in model_def.fields):
            print("➕ Adding default 'id' primary key column")
            columns = [
                Column('id', Integer, primary_key=True)
            ]
        else:
            columns = []

        # Map Python types to SQLAlchemy types
        type_map = {
            'str': String,
            'int': Integer,
            'float': Float,
            'bool': Boolean,
            'datetime': DateTime
        }

        # Add model fields
        for field_def in model_def.fields:
            if field_def.name.lower() == "id":
                print("Skipping ID field as it's already handled")
                continue
                
            sa_type = type_map.get(field_def.type.lower(), String)
            column_args = {}
            
            if field_def.primary_key:
                column_args['primary_key'] = True
            if field_def.default is not None:
                column_args['default'] = field_def.default
            
            print(f"Adding column: {field_def.name}, type: {sa_type}")
            columns.append(Column(field_def.name, sa_type, **column_args))

        # Create the table
        try:
            print("\n=== STARTING TABLE CREATION ===")
            print(f"Model Class: {model_class}")
            print(f"Model Fields: {model_class.__annotations__}")

            # Create fresh metadata to avoid conflicts
            from sqlalchemy import MetaData
            metadata = MetaData()

            # Create table directly
            table = Table(
                model_class.__tablename__,
                metadata,
                *columns
            )
            print(f"Created Table object: {table}")

            # Create in database
            metadata.create_all(self.engine)
            print("Executed create_all()")

            # Verify
            inspector = inspect(self.engine)
            existing_tables = inspector.get_table_names()
            print(f"Existing tables: {existing_tables}")
            
            if model_class.__tablename__ not in existing_tables:
                print(f"Table creation failed - '{model_class.__tablename__}' not found")
                raise RuntimeError(f"Table creation failed - '{model_class.__tablename__}' not found")

            print(f"✅ Successfully created table '{model_class.__tablename__}'")

        except Exception as e:
            print(f"❌ Table creation failed: {str(e)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(
                status_code=500,
                detail=f"Table creation failed: {str(e)}"
            )

        # Generate CRUD endpoints
        print(f"Generating CRUD router for {model_class.__name__}")
        router = self.create_crud_router(model_class)
        self.include_router(router)
        
        # Create folder and files
        model_folder = f"app/models/{model_def.name.lower().replace(' ', '_')}"
        print(f"Creating model folder: {model_folder}")
        logger.info(f"Creating folder: {model_folder}")
        self.update_routes_file(model_def.name)
        os.makedirs(model_folder, exist_ok=True)

        # Ensure app/models/<model_name>/ is a package
        init_file = f"{model_folder}/__init__.py"
        if not os.path.exists(init_file):
            print(f"Creating __init__.py in: {init_file}")
            logger.info(f"Creating __init__.py in: {init_file}")
            with open(init_file, "w") as f:
                f.write("")
        
        # Generate and write model.py
        model_content = self.generate_model_file(model_def, model_class)
        model_file_path = f"{model_folder}/model.py"
        print(f"Writing model file: {model_file_path}")
        logger.info(f"Writing model file: {model_file_path}")
        with open(model_file_path, "w") as f:
            f.write(model_content)
        
        # Generate and write api.py using the template
        api_content = get_api_template(model_class.__name__, model_class.__tablename__)
        api_file_path = f"{model_folder}/api.py"
        print(f"Writing api file: {api_file_path}")
        logger.info(f"Writing api file: {api_file_path}")
        with open(api_file_path, "w") as f:
            f.write(api_content)
        
        # Dynamically include the generated router
        module_name = f"app.models.{model_def.name.lower().replace(' ', '_')}.api"
        print(f"Attempting to import router: {module_name}")
        try:
            if module_name in sys.modules:
                print(f"Removing cached router module: {module_name}")
                del sys.modules[module_name]
            router_module = import_module(module_name)
            self.include_router(router_module.router)
            print(f"Successfully included router for {model_def.name}")
            logger.info(f"Successfully included router for {model_def.name}")
        except ImportError as e:
            print(f"Failed to import router for {model_def.name}: {str(e)}")
            logger.error(f"Failed to import router for {model_def.name}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to include router for {model_def.name}: {str(e)}")
        
        print(f"Model creation completed for {model_def.name}")
        return {
            "message": f"Model {model_def.name} created successfully",
            "endpoints": f"/{model_class.__tablename__}",
            "files_created": [
                model_file_path,
                api_file_path
            ]
        }

    def update_routes_file(self, model_name: str):
        print(f"Updating routes file for model: {model_name}")
        file_path = "app/routes/main.py"
        import_line = f"from app.models.{model_name.lower()} import api as {model_name.lower()}"
        include_line = f"router.include_router({model_name.lower()}.router)"

        with open(file_path, "r") as file:
            content = file.read()

        if import_line not in content:
            lines = content.splitlines()

            # Find where to insert the import
            last_import_index = max(
                i for i, line in enumerate(lines)
                if line.startswith("from app.models") or line.startswith("from app.routes")
            )
            print(f"Inserting import at line {last_import_index + 1}: {import_line}")
            lines.insert(last_import_index + 1, import_line)

            # Find where to insert the include_router
            last_include_index = max(
                i for i, line in enumerate(lines)
                if line.strip().startswith("router.include_router")
            )
            print(f"Inserting include_router at line {last_include_index + 1}: {include_line}")
            lines.insert(last_include_index + 1, include_line)

            with open(file_path, "w") as file:
                file.write("\n".join(lines))

            print(f"✅ routes.py updated with: {model_name}")
        else:
            print(f"ℹ️ routes.py already includes {model_name}")