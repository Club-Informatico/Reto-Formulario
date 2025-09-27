from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.models import Registration, RegistrationCreate, RegistrationRead
from app.db import get_session
from app.utils import *

router = APIRouter()

@router.post("/register", response_model=RegistrationRead, status_code=status.HTTP_201_CREATED)
def create_registration(payload: RegistrationCreate, session: Session = Depends(get_session)):
  rut_norm = normalize_and_validate_rut(payload.rut)

  if not rut_norm:
    raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "RUT inválido")

  if "@" not in payload.email:
    raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Email inválido")
  
  if not payload.full_name.strip():
    raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Nombre requerido")

  exists = session.exec(select(Registration).where(Registration.rut == rut_norm)).first()
  if exists:
    raise HTTPException(status.HTTP_409_CONFLICT, "El RUT ya existe")

  reg = Registration(
    full_name=payload.full_name.strip(),
    rut=rut_norm,
    birthdate=payload.birthdate,
    phone=payload.phone.strip(),
    email=payload.email.strip(),
  )

  session.add(reg)
  session.commit()
  session.refresh(reg)

  return reg

@router.get("/register", response_model=List[RegistrationRead])
def list_registrations(session: Session = Depends(get_session)):
  stmt = select(Registration)
  
  return session.exec(stmt).all()
