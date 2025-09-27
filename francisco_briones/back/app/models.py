from __future__ import annotations

from datetime import datetime
from typing import Dict

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Submission(db.Model):
    __tablename__ = "submissions"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    rut = db.Column(db.String(20), nullable=False)
    dob = db.Column(db.String(10), nullable=False)  # YYYY-MM-DD
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.String(32), nullable=False, default=lambda: datetime.utcnow().isoformat(timespec="seconds") + "Z")

    def to_dict(self) -> Dict[str, str]:
        return {
            "id": self.id,
            "name": self.name,
            "rut": self.rut,
            "dob": self.dob,
            "phone": self.phone,
            "email": self.email,
            "created_at": self.created_at,
        }
