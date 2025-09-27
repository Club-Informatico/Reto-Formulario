from __future__ import annotations

import re
from datetime import date, datetime
from typing import Dict, Tuple

NAME_RE = re.compile(r"^[A-Za-zÁÉÍÓÚÑáéíóúñ]+(?:\s+[A-Za-zÁÉÍÓÚÑáéíóúñ]+)+$")
DOB_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
PHONE_RE = re.compile(r"^(?:\+?56\s?)?(?:9\s?)?\d{8}$")
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def _clean_rut(v: str) -> str:
    return re.sub(r"[^0-9kK]", "", v)


def _compute_dv(body: str) -> str:
    s, m = 0, 2
    for ch in reversed(body):
        s += int(ch) * m
        m = 2 if m == 7 else m + 1
    rest = 11 - (s % 11)
    if rest == 11:
        return "0"
    if rest == 10:
        return "K"
    return str(rest)


def validate_payload(payload: Dict[str, str]) -> Tuple[bool, Dict[str, str]]:
    errors: Dict[str, str] = {}

    name = (payload.get("name") or "").strip()
    rut = (payload.get("rut") or "").strip()
    dob = (payload.get("dob") or "").strip()
    phone = (payload.get("phone") or "").strip()
    email = (payload.get("email") or "").strip()

    if not NAME_RE.match(name):
        errors["name"] = "Nombre debe tener al menos dos palabras, solo letras y espacios."

    cr = _clean_rut(rut)
    if len(cr) < 2 or not cr[:-1].isdigit():
        errors["rut"] = "RUT inválido."
    else:
        body, dv = cr[:-1], cr[-1].upper()
        if _compute_dv(body) != dv:
            errors["rut"] = "RUT inválido (DV no coincide)."

    if not DOB_RE.match(dob):
        errors["dob"] = "Fecha debe tener formato YYYY-MM-DD."
    else:
        try:
            dob_date = datetime.strptime(dob, "%Y-%m-%d").date()
            today = date.today()
            if dob_date > today:
                errors["dob"] = "Fecha no puede ser futura."
            elif dob_date < date(1900, 1, 1):
                errors["dob"] = "Fecha demasiado antigua."
        except ValueError:
            errors["dob"] = "Fecha inválida."

    if not PHONE_RE.match(phone):
        errors["phone"] = "Teléfono inválido. Ej: +56 9 12345678 o 912345678"

    if not EMAIL_RE.match(email):
        errors["email"] = "Email inválido."

    return (len(errors) == 0), errors
