from __future__ import annotations

from datetime import datetime
from flask import Blueprint, jsonify, render_template, request

from .models import db, Submission
from .validators import validate_payload

bp = Blueprint("main", __name__)


@bp.get("/")
def index():
    # Minimal template to indicate backend is up; React app runs on Vite in dev
    return render_template("index.html")


@bp.post("/submit")
def submit():
    data = request.get_json(silent=True) or {}
    ok, errors = validate_payload(data)
    if not ok:
        return jsonify({"ok": False, "errors": errors}), 400

    created = Submission(
        name=data["name"].strip(),
        rut=data["rut"].strip(),
        dob=data["dob"].strip(),
        phone=data["phone"].strip(),
        email=data["email"].strip(),
        created_at=datetime.utcnow().isoformat(timespec="seconds") + "Z",
    )
    db.session.add(created)
    db.session.commit()

    return jsonify({"ok": True, "message": "Datos guardados correctamente."})


@bp.get("/submissions")
def list_submissions():
    items = Submission.query.order_by(Submission.id.desc()).all()
    return jsonify([it.to_dict() for it in items])
