from fastapi import APIRouter
from app.routes import auth, users, habits, streak


router = APIRouter()


router.include_router(auth.router)
router.include_router(users.router)
router.include_router(habits.router)
router.include_router(streak.router)
