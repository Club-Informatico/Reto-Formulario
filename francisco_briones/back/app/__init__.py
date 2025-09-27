from __future__ import annotations

import os
from flask import Flask
from flask_cors import CORS

from .models import db
from .routes import bp as api_bp


def create_app() -> Flask:
    app = Flask(
        __name__,
        instance_relative_config=True,
        static_folder="static",
        template_folder="templates",
    )

    # Ensure instance folder for SQLite DB exists
    os.makedirs(app.instance_path, exist_ok=True)

    db_uri = os.environ.get("DATABASE_URL")
    if not db_uri:
        db_path = os.path.join(app.instance_path, "data.db")
        db_uri = f"sqlite:///{db_path}"

    app.config.update(
        SQLALCHEMY_DATABASE_URI=db_uri,
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
    )

    db.init_app(app)

    # Allow local dev from Vite
    CORS(app, resources={r"/*": {"origins": ["http://127.0.0.1:5173", "http://localhost:5173", "*"]}})

    # Create tables
    with app.app_context():
        db.create_all()

    # Routes
    app.register_blueprint(api_bp)

    return app


# For local runs: `python -m back.app`
app = create_app()
