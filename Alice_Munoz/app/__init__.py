# app/__init__.py

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os

# Creamos las instancias sin asociarlas a la app todavía
db = SQLAlchemy()
app = Flask(__name__,
            instance_relative_config=True,
            template_folder='../templates',
            static_folder='../static')

def create_app():
    """Desafio Formulario"""
    basedir = os.path.abspath(os.path.dirname(__file__))

    # Configurar la app
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, '../database.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = '$2a$10$sy2KkwVVnzHVO9lFOnlV1OhlcfJXFX3pt0arrGMz4QDXwjl63mACy'  # ¡Añade esto!

    # Inicializamos la base de datos
    db.init_app(app)

    with app.app_context():
        # Importamos las rutas y modelos
        from . import routes
        from . import models

        # Creamos las tablas de la base de datos
        db.create_all()

    return app