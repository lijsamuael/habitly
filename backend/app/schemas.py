from datetime import datetime
from pydantic import BaseModel
from sqlmodel import SQLModel, Field
from typing import List, Literal



class User(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    full_name: str | None = Field(unique=True, index=True)
    email: str = Field(unique=True, index=True)
    password: str 


class Habit(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    description: str | None = None
    user_id: int = Field(foreign_key="user.id")
    current_streak: int = Field(default=0)
    max_streak: int = Field(default=0)
    last_completed_date: datetime | None = None


class Streak(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    habit_id: int = Field(foreign_key="habit.id")
    date_completed: datetime


class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str


#Rest api request format
FieldType = Literal["str", "int", "float", "bool", "datetime"]

class ModelFieldDefinition(BaseModel):
    name: str
    type: FieldType
    required: bool = True
    default: str | None = None
    primary_key: bool = False
    foreign_key: str | None = None



class ModelDefinition(BaseModel):
    name: str
    fields: List[ModelFieldDefinition]