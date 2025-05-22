from datetime import datetime, timedelta, timezone, date
from passlib.context import CryptContext
import jwt
import os
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select
from app.schemas import Habit, Streak, User
from dotenv import load_dotenv
from fastapi import BackgroundTasks, HTTPException
from jinja2 import Template
import emails

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

MAIL_USERNAME = os.getenv('MAIL_USERNAME')
MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
MAIL_FROM = os.getenv('MAIL_FROM')
MAIL_PORT = int(os.getenv('MAIL_PORT'))
MAIL_SERVER = os.getenv('MAIL_SERVER')
MAIL_FROM_NAME = os.getenv('MAIN_FROM_NAME')

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(session: Session, email: str, password: str) -> User | bool:
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user

def send_email(background_tasks: BackgroundTasks, subject: str, email_to: str, body: str):
    """
    Compose an email message using the emails library and schedule it to be sent in the background.
    The body parameter is a string containing valid HTML.
    """
    message = emails.Message(
        subject=subject,
        html=Template(body).render(),
        mail_from=MAIL_FROM
    )
    
    smtp_conf = {
        "host": MAIL_SERVER,
        "port": MAIL_PORT,
        "tls": True,  # Using TLS by default
        "user": MAIL_USERNAME,
        "password": MAIL_PASSWORD
    }
    
    background_tasks.add_task(send_email_task, message, email_to, smtp_conf)

def send_email_task(message, email_to, smtp_conf):
    """
    Task to send an email. Catches exceptions to log errors like network connectivity issues.
    """
    try:
        response = message.send(to=email_to, smtp=smtp_conf)
        if response.status_code != 250:
            print(f"Failed to send email: {response.error}")
        else:
            print("Email sent successfully.")
    except Exception as exc:
        print(f"Exception occurred while sending email: {exc}")

def get_current_user(token: str, session: Session):
    """Decodes the JWT and retrieves the current user from the database."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            return None
        user = session.exec(select(User).where(User.email == email)).first()
        return user
    except jwt.ExpiredSignatureError:
        return None  
    except jwt.InvalidTokenError:
        return None  


def update_streak(habit: Habit, db: Session):
    try:
        today = datetime.now()

        if habit.last_completed_date and habit.last_completed_date.date() == today.date():
            return True # Already logged for today

        # Check if streak is continued
        if habit.last_completed_date and (today - habit.last_completed_date).days == 1:
            habit.current_streak += 1
        else:
            habit.current_streak = 1  # Reset streak if a day was missed

        # Update max streak
        habit.max_streak = max(habit.max_streak, habit.current_streak)
        habit.last_completed_date = today

        # Add a new streak entry
        new_streak = Streak(habit_id=habit.id, date_completed=today)
        db.add(new_streak)
        db.commit()
        db.refresh(habit)
        return True
    except Exception as e:
        db.rollback()  # Rollback changes if an error occurs
        raise HTTPException(status_code=500, detail=f"Error updating streak: {str(e)}")


def reset_missed_streaks(db: Session):
    """Check all habits and reset streaks if a day was missed"""
    try:
        today = date.today()
        habits = db.exec(select(Habit)).all()
        
        for habit in habits:
            if habit.last_completed_date:
                days_since_last = (today - habit.last_completed_date.date()).days
                if days_since_last > 1:  # More than one day missed
                    habit.current_streak = 0
                    db.add(habit)
        
        db.commit()
        print("Daily streak reset check completed")
    except Exception as e:
        db.rollback()
        print(f"Error in streak reset scheduler: {str(e)}")
