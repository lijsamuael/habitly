from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import APIRouter, BackgroundTasks, Depends
from app.schemas import Token, User, UserCreate, UserResponse
from passlib.context import CryptContext
from datetime import timedelta
from app.db import get_session
from sqlmodel import Session, select
from dotenv import load_dotenv
import os


load_dotenv()

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

from app.utils import authenticate_user, create_access_token, get_password_hash, send_email


router = APIRouter( tags=["auth"])



@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Session = Depends(get_session),
) -> Token:
    user = authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")

@router.post("/register", response_model=UserResponse)
def create_user(
    user_in: UserCreate,
    session: Session = Depends(get_session),
) -> User:
    # Check if user already exists
    existing_user = session.exec(select(User).where(User.email == user_in.email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists.",
        )

    # Hash the password and create the user
    hashed_password = get_password_hash(user_in.password)
    user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        password=hashed_password,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/send-email-background")
def send_email_background(
    background_tasks: BackgroundTasks,
    email_to: str,
) -> dict:  
    subject = "Welcome Message"
    body = {"name": "Samuaek Ketema", "title": "Welcome to Habitly"}
    body_str = f"""
    <html>
        <body>
            <h1>{body['title']}</h1>
            <p>Dear {body['name']},</p>
            <p>Welcome to Habitly! We are excited to have you join us.</p>
        </body>
    </html>
    """
    send_email(background_tasks, subject, email_to, body_str)
    return {"message": "Email sent successfully"}  

