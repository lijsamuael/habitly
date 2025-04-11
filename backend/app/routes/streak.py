from fastapi import APIRouter, HTTPException
from sqlmodel import select
from app.db import SessionDep
from app.crud import CRUDBase
from app.models import Habit, Streak, User
from fastapi.security import OAuth2PasswordBearer
from datetime import date, datetime, timedelta
from sqlalchemy import and_


from app.utils import update_streak

streak_crud = CRUDBase(Streak)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


router = APIRouter(prefix="/streaks", tags=["streaks"])

@router.get("/{streak_id}")
def get_streak(streak_id: int, db: SessionDep):
    return streak_crud.get(db, streak_id)


@router.get("/streak-days/{user_id}", response_model=list[date])
def get_user_streak_days(
    user_id: int,
    db: SessionDep,
    days_back: int = 30
):
    """
    Returns a list of dates where the user had at least one streak activity
    within the specified time period (default: last 30 days)
    """
    try:
        # Verify user exists
        user = db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Calculate date range
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days_back)

        # Get all unique dates with streak activities for this user
        statement = select(Streak.date_completed).join(Habit).where(
            and_(
                Habit.user_id == user_id,
                Streak.date_completed >= start_date,
                Streak.date_completed <= end_date
            )
        ).distinct()

        # Correct way to handle the results
        results = db.exec(statement)
        streak_dates = [result.date() for result in results]
        
        # Remove duplicates and sort
        unique_dates = sorted(list({d for d in streak_dates if d}))
        
        return unique_dates
    
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error retrieving streak days: {str(e)}"
        )

@router.get("/")
def get_all_streaks(db: SessionDep):
    return streak_crud.get_all(db)

@router.post("/")
def create_streak(streak: Streak, db: SessionDep):
    habit = db.get(Habit, streak.habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return update_streak(habit, db)



@router.delete("/{streak_id}")
def delete_streak(streak_id: int, db: SessionDep):
    return streak_crud.delete(db, streak_id)

