import re
from typing import Optional

def _clean_rut(v: str) -> str:
  return re.sub(r"[.\s-]", "", (v or "").upper())

def _compute_dv(body: str) -> str:
  s, m = 0, 2
  
  for ch in reversed(body):
    s += int(ch) * m
    m = 2 if m == 7 else m + 1
  r = 11 - (s % 11)

  if r == 11:
    return "0"
  
  if r == 10:
    return "K"
  
  return str(r)

def normalize_and_validate_rut(rut: str) -> Optional[str]:
  v = _clean_rut(rut)

  if len(v) < 2 or not v[:-1].isdigit():
    return None
  
  body, dv = v[:-1], v[-1]

  return f"{body}-{dv}" if _compute_dv(body) == dv else None