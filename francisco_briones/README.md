## Instalacion

### Backend (Flask)
1) cd Reto-Formulario/back
2) python -m venv .venv
3) .venv\Scripts\activate
4) pip install -r requirements.txt
5) python -m app

La API quedará en http://127.0.0.1:5000

### Frontend (React + Vite)
1) cd Reto-Formulario/front
2) npm install
3) npm run dev

La UI quedará en http://127.0.0.1:5173 y consumirá la API local.

Notas:
- Si usas Linux/Mac, activa el venv con `source .venv/bin/activate`.
- La base SQLite se guarda en la carpeta `back/instance/` automáticamente.

## Deploy

Backend (WSGI):
- Instala deps: `pip install -r back/requirements.txt`
- Servidor WSGI (ejemplos):
   - gunicorn -w 2 -b 0.0.0.0:5000 'wsgi:application' (desde el directorio `back`)
- Variables opcionales:
   - DATABASE_URL: cadena SQLAlchemy si no quieres SQLite por defecto

Frontend (estático):
- cd front; npm install; npm run build
- Sirve el contenido de `front/dist` con Nginx/Apache o un servicio de archivos estáticos.

Topología recomendada:
- Nginx como reverse proxy al backend (Flask en WSGI) y hosteando `front/dist`.
- Configurar CORS/base URL si el dominio del front y back difieren.

## Features
- [x] Backend Flask con arquitectura modular (app factory, blueprints)
- [x] ORM SQLAlchemy + SQLite (configurable por DATABASE_URL)
- [x] Validaciones robustas (nombre, RUT módulo 11, fecha, teléfono, email)
- [x] API REST: POST /submit, GET /submissions
- [x] Front React + Vite con validación en vivo y datepicker personalizado
- [x] Toasts, barra de acciones fija, tabla de envíos recientes
- [x] Tema claro y oscuro con paleta tipo Reddit
