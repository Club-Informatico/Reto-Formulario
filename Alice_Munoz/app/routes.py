# app/routes.py

from . import app, db # Importamos app y db desde el __init__.py
from .models import Usuario # Importamos nuestro modelo
from flask import render_template, request, redirect, url_for, flash
import re
from .valida_rut import validar_rut_completo_python

@app.route('/')
def index():
    # Aqui modifique la funcion para que aparte de mostrar el index, cargue los usuarios desde la db
    # .order_by(Usuario.id.desc()) los ordena del más nuevo al más antiguo
    usuarios = Usuario.query.order_by(Usuario.id.desc()).all()
    # Le pasamos la lista de usuarios al template
    # tambien cree un diccionario vacio con form_data={} , porque si es la primera vez que renderiza la pagina arrojaria un error
    # jinja si no hay datos en la base, por eso para iniciar la variable
    return render_template('index.html', usuarios=usuarios, form_data={})


@app.route('/submit', methods=['POST'])
def submit():

    # --- VALIDACIÓN EN EL BACKEND ---

    nombre = request.form['nombre']
    rut = request.form['rut']
    fecha_nacimiento = request.form['fecha_nacimiento']
    telefono = request.form['telefono']
    email = request.form['email']

    errores = []  # Una lista para guardar los mensajes de error

    # Validamos cada campo
    if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$', nombre):
        errores.append("El nombre tiene un formato incorrecto.")

        # --- Llamamos a la funcion de VALIDACION DEL RUT EN EL BACKEND CON EL CODIGO PYTHON QUE tomamos prestado DE GITHUB ---
    if not validar_rut_completo_python(rut):
        errores.append("El RUT ingresado es inválido.")

    if not re.match(r'^\+?569\d{8}$', telefono):
        errores.append("El teléfono tiene un formato incorrecto.")

    if not re.match(r'^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$', email):
        errores.append("El email tiene un formato incorrecto.")

    # Si hay algún error en el caso improbable que haya pasado de la validacion del frontend
    if errores:
        for error in errores:
            flash(error, 'error')
            usuarios = Usuario.query.order_by(Usuario.id.desc()).all()
            return render_template('index.html', usuarios=usuarios, form_data=request.form)


    # --- FIN DE LA VALIDACIÓN ---

    # Si no hubo errores, guarda la informacion en la Base de Datos

    nuevo_usuario = Usuario(
        nombre=nombre, rut=rut, fecha_nacimiento=fecha_nacimiento,
        telefono=telefono, email=email
    )

    db.session.add(nuevo_usuario)
    db.session.commit()

    flash('¡Usuario registrado con éxito!', 'success')  # Mensaje de éxito
    return redirect(url_for('index'))