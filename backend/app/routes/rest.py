from app.db import get_session
from app.routes.engine import Saad
from app.schemas import ModelDefinition
from fastapi import APIRouter


router = APIRouter(prefix="/rest", tags=["rest"])

core = Saad(
    get_session=get_session
)

@router.post("/generate-rest-api")
def define_model(model_def: ModelDefinition):
    return core.define_model(model_def)
