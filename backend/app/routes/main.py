from fastapi import APIRouter
from app.routes import auth

router = APIRouter()


router.include_router(auth.router)