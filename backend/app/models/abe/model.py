from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class abe(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    string: str = Field(default="string")
