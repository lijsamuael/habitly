from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Doctype(SQLModel, table=True):
    id: int = Field(primary_key=True)
    Name: str = Field(default="Unknown")
    Description: Optional[str] = Field(default="N/A")
    Owner: int = Field(foreign_key="user.id")
