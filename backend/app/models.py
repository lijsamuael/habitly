from sqlmodel import SQLModel, Field


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