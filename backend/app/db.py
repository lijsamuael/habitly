import os
from typing import Annotated
from dotenv import load_dotenv

from fastapi import Depends
from sqlmodel import create_engine, Session

#load env variables
load_dotenv()

# Database credentials
POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")
POSTGRES_DB = os.getenv("POSTGRES_DB")

# Database URL

DATABASE_URL = f"postgresql+psycopg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

#creates a database engine using the connection string
engine = create_engine(DATABASE_URL)


#initializes the database by creating tables
def init_db(session: Session) -> None:
    pass

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]