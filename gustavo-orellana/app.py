from flask import Flask, request, render_template, redirect
import sqlite3

conexion = sqlite3.connect('db.db')
cursor = conexion.cursor()
cursor.execute('''
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        rut TEXT NOT NULL,
        fecha TEXT NOT NULL,
        telefono TEXT NOT NULL,
        email TEXT NOT NULL
    )
''')
conexion.commit()
conexion.close()

app = Flask(__name__, static_folder='static',template_folder='templates')
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add_usuario' , methods = ['POST'])

def add_usuario():
    conexion = sqlite3.connect('db.db')
    cursor = conexion.cursor()
    if request.method == 'POST':
        nombre = request.form['nombre']
        rut = request.form['rut']
        fecha= request.form['fecha']
        telefono = request.form['telefono']
        email = request.form['email']
        cursor.execute('INSERT INTO usuarios (nombre,rut,fecha,telefono,email) VALUES (?,?,?,?,?)', (nombre,rut,fecha,telefono,email))
        conexion.commit()
        conexion.close()
        print('Datos ingresados correctamente')
        return redirect('/')
if __name__ == '__main__':
    app.run(debug=True)