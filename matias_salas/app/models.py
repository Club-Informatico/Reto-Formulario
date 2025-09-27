from datetime import date, datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class Registration(SQLModel, table=True):
  id: Optional[int] = Field(default=None, primary_key=True)
  full_name: str
  rut: str
  birthdate: date
  phone: str
  email: str
  created_at: datetime = Field(default_factory=datetime.utcnow)

class RegistrationCreate(SQLModel):
  full_name: str
  rut: str
  birthdate: date
  phone: str
  email: str

class RegistrationRead(SQLModel):
  id: int
  full_name: str
  rut: str
  birthdate: date
  phone: str
  email: str
  created_at: datetime
