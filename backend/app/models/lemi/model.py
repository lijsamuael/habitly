from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Lemi(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    asd: str = Field()
