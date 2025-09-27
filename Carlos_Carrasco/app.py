from flask import Flask, request, jsonify, render_template_string
import sqlite3
import re
from datetime import date, datetime

app = Flask(__name__)
DB = "data.db"

# ---------- DB ----------
def init_db():
    with sqlite3.connect(DB) as conn:
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                rut TEXT NOT NULL UNIQUE,
                fecha_nacimiento TEXT NOT NULL,
                email TEXT NOT NULL,
                telefono TEXT NOT NULL
            )
        """)
        conn.commit()

def insert_usuario(nombre, rut, fecha_nacimiento, email, telefono):
    with sqlite3.connect(DB) as conn:
        c = conn.cursor()
        c.execute("INSERT INTO usuarios (nombre, rut, fecha_nacimiento, email, telefono) VALUES (?, ?, ?, ?, ?)",
                  (nombre, rut, fecha_nacimiento, email, telefono))
        conn.commit()

def get_usuarios():
    with sqlite3.connect(DB) as conn:
        c = conn.cursor()
        c.execute("SELECT nombre, rut, fecha_nacimiento, email, telefono FROM usuarios ORDER BY id DESC")
        return c.fetchall()

# ---------- Validaciones backend ----------
re_nombre = re.compile(r"^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,50}$")
re_rut = re.compile(r"^\d{7,8}-[\dkK]$")
re_email = re.compile(r"^[\w\.-]+@[\w\.-]+\.\w+$")
re_telefono = re.compile(r"^\+?56?\d{8,9}$")  # acepta +56912345678 o 912345678

def dv_del_rut(rut_sin_dv: str) -> str:
    # calcula dígito verificador (0-9 o k)
    reversed_digits = map(int, reversed(rut_sin_dv))
    factors = [2,3,4,5,6,7]
    s = 0
    factor_index = 0
    for d in reversed_digits:
        s += d * factors[factor_index]
        factor_index = (factor_index + 1) % len(factors)
    mod = 11 - (s % 11)
    if mod == 11:
        return "0"
    if mod == 10:
        return "k"
    return str(mod)

def validar_rut_completo(rut: str) -> bool:
    rut = rut.strip()
    if not re_rut.match(rut):
        return False
    parts = rut.split("-")
    num = parts[0]
    dv = parts[1].lower()
    calc = dv_del_rut(num)
    return calc == dv

def validar_todos_campos(data: dict) -> (bool, str):
    nombre = data.get("nombre", "").strip()
    rut = data.get("rut", "").strip()
    fecha_n = data.get("fecha_nacimiento", "")
    email = data.get("email", "").strip()
    telefono = data.get("telefono", "").strip()

    if not re_nombre.match(nombre):
        return False, "Nombre inválido"
    if not re_rut.match(rut):
        return False, "Formato RUT inválido"
    if not validar_rut_completo(rut):
        return False, "Dígito verificador RUT inválido"
    try:
        f = datetime.strptime(fecha_n, "%Y-%m-%d").date()
    except Exception:
        return False, "Fecha inválida"
    if f > date.today():
        return False, "Fecha de nacimiento no puede ser futura"
    if not re_email.match(email):
        return False, "Email inválido"
    if not re_telefono.match(telefono):
        return False, "Teléfono inválido"
    return True, "OK"

# ---------- Rutas ----------
@app.route("/")
def index():
    # Página simple con HTML+JS que hace validaciones instantáneas
    return render_template_string("""
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Registro - Formulario</title>
<style>
    body { font-family: Arial, sans-serif; max-width:900px; margin:30px auto; padding:0 10px; }
    label { display:block; margin-top:12px; font-weight:600; }
    .input { position:relative; margin-top:6px; }
    input[type="text"], input[type="email"], input[type="date"] {
        width:100%; padding:10px 36px 10px 10px; box-sizing:border-box; border-radius:6px; border:1px solid #ccc;
        transition: border .15s, box-shadow .15s;
    }
    .valid { border:2px solid green !important; box-shadow: 0 0 6px rgba(0,128,0,0.12); background-position: right 10px center; background-repeat:no-repeat; padding-right:40px; }
    .invalid { border:2px solid red !important; box-shadow: 0 0 6px rgba(255,0,0,0.08);}
    .icon { position:absolute; right:10px; top:50%; transform:translateY(-50%); pointer-events:none; width:20px; height:20px; }
    .hint { color:#666; font-size:0.9em; margin-top:4px; }
    button { margin-top:14px; padding:10px 18px; border-radius:6px; background:#0b5cff; color:white; border:0; cursor:pointer; }
    table { width:100%; border-collapse:collapse; margin-top:20px; }
    th,td { padding:8px 6px; border:1px solid #eee; text-align:left; }
    .msg { margin-top:12px; padding:10px; border-radius:6px; }
    .ok { background:#e6ffed; color:#064; border:1px solid #c6f0d0; }
    .err { background:#ffecec; color:#900; border:1px solid #f2c6c6; }
</style>
</head>
<body>
  <h2>Formulario de Registro</h2>

  <div>
    <label>Nombre</label>
    <div class="input">
      <input id="nombre" type="text" placeholder="Ej: Juan Pérez" />
      <svg class="icon" id="icon-nombre" viewBox="0 0 16 16" style="display:none"></svg>
    </div>
    <div id="hint-nombre" class="hint"></div>

    <label>RUT</label>
    <div class="input">
      <input id="rut" type="text" placeholder="Ej: 11111111-1" />
      <svg class="icon" id="icon-rut" viewBox="0 0 16 16" style="display:none"></svg>
    </div>
    <div id="hint-rut" class="hint"></div>

    <label>Fecha de Nacimiento</label>
    <div class="input">
      <input id="fecha" type="date" max="{{ today }}" />
      <svg class="icon" id="icon-fecha" viewBox="0 0 16 16" style="display:none"></svg>
    </div>
    <div id="hint-fecha" class="hint"></div>

    <label>Email</label>
    <div class="input">
      <input id="email" type="email" placeholder="ejemplo@mail.com" />
      <svg class="icon" id="icon-email" viewBox="0 0 16 16" style="display:none"></svg>
    </div>
    <div id="hint-email" class="hint"></div>

    <label>Teléfono</label>
    <div class="input">
      <input id="telefono" type="text" placeholder="Ej: +56912345678" />
      <svg class="icon" id="icon-telefono" viewBox="0 0 16 16" style="display:none"></svg>
    </div>
    <div id="hint-telefono" class="hint"></div>

    <button id="guardar">Guardar</button>
    <div id="mensaje" class="msg" style="display:none;"></div>
  </div>

  <h3>Registros guardados</h3>
  <div id="tabla"></div>

<script>
// -------- regex y utilidades (frontend) --------
const reNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\\s]{2,50}$/;
const reRut = /^\\d{7,8}-[\\dkK]$/;
const reEmail = /^[\\w\\.-]+@[\\w\\.-]+\\.\\w+$/;
const reTelefono = /^\\+?56?\\d{8,9}$/;

// calcular DV (igual que en backend)
function dvDelRut(numStr) {
  const reversed = numStr.split('').reverse().map(Number);
  const factors = [2,3,4,5,6,7];
  let s = 0;
  for (let i=0;i<reversed.length;i++){
    s += reversed[i] * factors[i % factors.length];
  }
  const mod = 11 - (s % 11);
  if (mod === 11) return '0';
  if (mod === 10) return 'k';
  return String(mod);
}

function validarRutCompleto(rut) {
  if (!reRut.test(rut)) return false;
  const [num, dv] = rut.split('-');
  return dvDelRut(num) === dv.toLowerCase();
}

// icon helpers (check / x)
const svgCheck = '<path fill="green" d="M13.485 1.929a1.5 1.5 0 0 1 0 2.122l-7.07 7.07a1.5 1.5 0 0 1-2.122 0l-3.536-3.536a1.5 1.5 0 1 1 2.122-2.122L5 8.793l6.364-6.364a1.5 1.5 0 0 1 2.121 0z"/>';
const svgCross = '<path fill="red" d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>';

// setear estado visual
function setValid(el, iconEl, hintEl, ok, hintText='') {
  if (ok === null) {
    el.classList.remove('valid','invalid');
    iconEl.style.display = 'none';
    hintEl.textContent = '';
    return;
  }
  if (ok) {
    el.classList.add('valid'); el.classList.remove('invalid');
    iconEl.style.display = 'inline-block'; iconEl.innerHTML = svgCheck;
    hintEl.textContent = hintText;
  } else {
    el.classList.add('invalid'); el.classList.remove('valid');
    iconEl.style.display = 'inline-block'; iconEl.innerHTML = svgCross;
    hintEl.textContent = hintText;
  }
}

// obtener elementos
const nombre = document.getElementById('nombre');
const rut = document.getElementById('rut');
const fecha = document.getElementById('fecha');
const email = document.getElementById('email');
const telefono = document.getElementById('telefono');

const iconNombre = document.getElementById('icon-nombre');
const iconRut = document.getElementById('icon-rut');
const iconFecha = document.getElementById('icon-fecha');
const iconEmail = document.getElementById('icon-email');
const iconTelefono = document.getElementById('icon-telefono');

const hintNombre = document.getElementById('hint-nombre');
const hintRut = document.getElementById('hint-rut');
const hintFecha = document.getElementById('hint-fecha');
const hintEmail = document.getElementById('hint-email');
const hintTelefono = document.getElementById('hint-telefono');

function validarYMarcar() {
  // nombre
  const n = nombre.value.trim();
  setValid(nombre, iconNombre, hintNombre,
    n ? reNombre.test(n) : null,
    n && !reNombre.test(n) ? 'Solo letras, 2-50 caracteres' : ''
  );
  // rut: validamos formato y DV solo cuando cumple el formato
  const r = rut.value.trim();
  if (!r) setValid(rut, iconRut, hintRut, null);
  else if (!reRut.test(r)) setValid(rut, iconRut, hintRut, false, 'Formato: 11111111-1');
  else {
    const ok = validarRutCompleto(r);
    setValid(rut, iconRut, hintRut, ok, ok ? '' : 'Dígito verificador incorrecto');
  }
  // fecha
  const f = fecha.value;
  if (!f) setValid(fecha, iconFecha, hintFecha, null);
  else {
    const d = new Date(f);
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    setValid(fecha, iconFecha, hintFecha, d <= hoy, d > hoy ? 'Fecha no puede ser futura' : '');
  }
  // email
  const em = email.value.trim();
  setValid(email, iconEmail, hintEmail, em ? reEmail.test(em) : null, em && !reEmail.test(em) ? 'Email inválido' : '');
  // telefono
  const t = telefono.value.trim();
  setValid(telefono, iconTelefono, hintTelefono, t ? reTelefono.test(t) : null, t && !reTelefono.test(t) ? 'Teléfono inválido' : '');
}

nombre.addEventListener('input', validarYMarcar);
rut.addEventListener('input', validarYMarcar);
fecha.addEventListener('change', validarYMarcar);
email.addEventListener('input', validarYMarcar);
telefono.addEventListener('input', validarYMarcar);

// cargar tabla inicial
async function loadTabla() {
  const res = await fetch('/api/list');
  const data = await res.json();
  renderTabla(data);
}

function renderTabla(data) {
  if (!data || data.length === 0) {
    document.getElementById('tabla').innerHTML = '<div style="color:#666">No hay registros.</div>';
    return;
  }
  let html = '<table><thead><tr><th>Nombre</th><th>RUT</th><th>Fecha Nac.</th><th>Email</th><th>Teléfono</th></tr></thead><tbody>';
  data.forEach(r => {
    html += `<tr><td>${escapeHtml(r[0])}</td><td>${escapeHtml(r[1])}</td><td>${escapeHtml(r[2])}</td><td>${escapeHtml(r[3])}</td><td>${escapeHtml(r[4])}</td></tr>`;
  });
  html += '</tbody></table>';
  document.getElementById('tabla').innerHTML = html;
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// enviar al backend
document.getElementById('guardar').addEventListener('click', async () => {
  validarYMarcar();
  // leer valores
  const payload = {
    nombre: nombre.value.trim(),
    rut: rut.value.trim(),
    fecha_nacimiento: fecha.value,
    email: email.value.trim(),
    telefono: telefono.value.trim()
  };
  // pre-check frontend: todos válidos?
  const ok = reNombre.test(payload.nombre) && reRut.test(payload.rut) && validarRutCompleto(payload.rut)
           && payload.fecha_nacimiento && new Date(payload.fecha_nacimiento) <= new Date(new Date().setHours(0,0,0,0))
           && reEmail.test(payload.email) && reTelefono.test(payload.telefono);
  const mensajeEl = document.getElementById('mensaje');
  if (!ok) {
    mensajeEl.style.display='block'; mensajeEl.className='msg err'; mensajeEl.textContent='Corrige los campos marcados en rojo antes de guardar.';
    return;
  }
  // post
  const res = await fetch('/api/save', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  const j = await res.json();
  if (res.ok && j.status === 'ok') {
    mensajeEl.style.display='block'; mensajeEl.className='msg ok'; mensajeEl.textContent='Datos guardados correctamente.';
    // limpiar form
    nombre.value=''; rut.value=''; fecha.value=''; email.value=''; telefono.value='';
    validarYMarcar();
    renderTabla(j.data || []);
  } else {
    mensajeEl.style.display='block'; mensajeEl.className='msg err'; mensajeEl.textContent = j.message || 'Error al guardar';
  }
});

loadTabla();
</script>
</body>
</html>
    """, today=date.today().isoformat())

@app.route("/api/save", methods=["POST"])
def api_save():
    data = request.get_json()
    ok, msg = validar_todos_campos(data)
    if not ok:
        return jsonify({"status":"error", "message":msg}), 400
    try:
        insert_usuario(
            data["nombre"].strip(),
            data["rut"].strip().lower(),
            data["fecha_nacimiento"],
            data["email"].strip(),
            data["telefono"].strip()
        )
    except sqlite3.IntegrityError as e:
        return jsonify({"status":"error", "message":"RUT ya registrado"}), 400
    rows = get_usuarios()
    return jsonify({"status":"ok", "data": rows}), 200

@app.route("/api/list")
def api_list():
    return jsonify(get_usuarios())

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
