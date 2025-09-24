from flask import Flask, render_template, request, jsonify, g
import os, re, sqlite3, datetime

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
INSTANCE_DIR = os.path.join(BASE_DIR, "instance")
DB_PATH = os.path.join(INSTANCE_DIR, "app.db")
SCHEMA_PATH = os.path.join(BASE_DIR, "schema.sql")

os.makedirs(INSTANCE_DIR, exist_ok=True)

app = Flask(__name__, static_folder="static", template_folder="templates",
            instance_path=INSTANCE_DIR, instance_relative_config=True)
app.config.update(SECRET_KEY="dev", DATABASE=DB_PATH)

# ------------------------------
# DB helpers
# ------------------------------
def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(app.config["DATABASE"])
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(_exc):
    db = g.pop("db", None)
    if db:
        db.close()

def init_db():
    db = get_db()
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        db.executescript(f.read())
    db.commit()

if not os.path.exists(DB_PATH):
    with app.app_context():
        init_db()

# ------------------------------
# Validaciones servidor
# ------------------------------
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
PHONE_RE = re.compile(r"^(?:\+?56[\s-]?)?(?:\d[\s-]?){9}$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
RUT_FMT_RE = re.compile(r"^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$")

def rut_clean(rut: str) -> str:
    return re.sub(r"[^0-9kK]", "", rut).lower()

def rut_dv(number: int) -> str:
    s = 0; m = 2
    for d in map(int, reversed(str(number))):
        s += d * m
        m = 2 if m == 7 else m + 1
    r = 11 - (s % 11)
    return "0" if r == 11 else "k" if r == 10 else str(r)

def rut_is_valid(rut: str) -> bool:
    c = rut_clean(rut)
    if len(c) < 2: return False
    num, dv = c[:-1], c[-1]
    return num.isdigit() and rut_dv(int(num)) == dv

def is_valid_iso_date(s: str) -> bool:
    if not DATE_RE.match(s or ""):
        return False
    try:
        datetime.date.fromisoformat(s)  # solo valida que exista
        return True
    except ValueError:
        return False

def validate_payload(d):
    errors = {}
    nombre = (d.get("nombre") or "").strip()
    rut = (d.get("rut") or "").strip()
    birthdate = (d.get("birthdate") or "").strip()
    phone = (d.get("phone") or "").strip()
    email = (d.get("email") or "").strip()

    if not re.match(r"^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)+$", nombre):
        errors["nombre"] = "Nombre y apellido(s) requeridos."

    if not RUT_FMT_RE.match(rut) or not rut_is_valid(rut):
        errors["rut"] = "RUT inválido. Usa 12.345.678-5."

    if not is_valid_iso_date(birthdate):
        errors["birthdate"] = "Fecha inválida. Usa YYYY-MM-DD."

    if not PHONE_RE.match(phone):
        errors["phone"] = "Teléfono chileno inválido (+56 opcional, 9 dígitos)."

    if not EMAIL_RE.match(email):
        errors["email"] = "Email inválido."

    return errors

# Normalizador SQL para comparar RUT (sin puntos/guión, lower)
NORM_RUT_SQL = "REPLACE(REPLACE(LOWER(rut),'.',''),'-','')"

# ------------------------------
# Rutas
# ------------------------------
@app.get("/")
def index():
    return render_template("index.html")

@app.post("/submit")
def submit():
    data = request.get_json(silent=True) or request.form
    errors = validate_payload(data)
    if errors:
        return jsonify({"ok": False, "errors": errors}), 400

    db = get_db()
    try:
        db.execute(
            "INSERT INTO people (nombre, rut, birthdate, phone, email) VALUES (?, ?, ?, ?, ?)",
            (
                data["nombre"].strip(),
                data["rut"].strip(),
                data["birthdate"].strip(),
                data["phone"].strip(),
                data["email"].strip(),
            ),
        )
        db.commit()
    except sqlite3.IntegrityError:
        return jsonify({"ok": False, "errors": {"rut": "Ese RUT ya está registrado."}}), 409

    return jsonify({"ok": True, "message": "Registro guardado con éxito."}), 200

@app.get("/api/records")
def records():
    db = get_db()
    rows = db.execute(
        "SELECT id, nombre, rut, birthdate, phone, email, created_at FROM people ORDER BY id DESC LIMIT 100"
    ).fetchall()
    return jsonify({"ok": True, "data": [dict(r) for r in rows]})

@app.post("/api/delete")
def delete_users():
    data = request.get_json(silent=True) or {}
    ids = data.get("ids", [])
    if not isinstance(ids, list) or not ids:
        return jsonify({"ok": False, "error": "Debes enviar una lista de IDs."}), 400
    try:
        ids = [int(i) for i in ids]
    except Exception:
        return jsonify({"ok": False, "error": "IDs inválidos."}), 400

    qmarks = ",".join(["?"] * len(ids))
    db = get_db()
    cur = db.execute(f"DELETE FROM people WHERE id IN ({qmarks})", ids)
    db.commit()
    return jsonify({"ok": True, "deleted": cur.rowcount})

@app.get("/api/user")
def get_user_by_rut():
    rut = (request.args.get("rut") or "").strip()
    if not rut or not RUT_FMT_RE.match(rut) or not rut_is_valid(rut):
        return jsonify({"ok": False, "error": "RUT inválido."}), 400

    db = get_db()
    row = db.execute(
        f"SELECT id, nombre, rut, birthdate, phone, email FROM people WHERE {NORM_RUT_SQL} = ? LIMIT 1",
        (rut_clean(rut),)
    ).fetchone()
    if not row:
        return jsonify({"ok": True, "user": None})
    return jsonify({"ok": True, "user": dict(row)})

@app.post("/api/update")
def update_user():
    data = request.get_json(silent=True) or {}
    rut = (data.get("rut") or "").strip()
    nombre = (data.get("nombre") or "").strip()
    birthdate = (data.get("birthdate") or "").strip()
    phone = (data.get("phone") or "").strip()
    email = (data.get("email") or "").strip()

    # Validaciones: mismo criterio que create, pero RUT solo para identidad (no se cambia aquí)
    errors = {}
    if not rut or not RUT_FMT_RE.match(rut) or not rut_is_valid(rut):
        errors["rut"] = "RUT inválido."
    if not re.match(r"^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)+$", nombre):
        errors["nombre"] = "Nombre y apellido(s) requeridos."
    if not is_valid_iso_date(birthdate):
        errors["birthdate"] = "Fecha inválida. Usa YYYY-MM-DD."
    if not PHONE_RE.match(phone):
        errors["phone"] = "Teléfono chileno inválido (+56 opcional, 9 dígitos)."
    if not EMAIL_RE.match(email):
        errors["email"] = "Email inválido."
    if errors:
        return jsonify({"ok": False, "error": " • ".join(errors.values())}), 400

    db = get_db()
    cur = db.execute(
        f"UPDATE people SET nombre=?, birthdate=?, phone=?, email=? WHERE {NORM_RUT_SQL}=?",
        (nombre, birthdate, phone, email, rut_clean(rut))
    )
    db.commit()
    if cur.rowcount == 0:
        return jsonify({"ok": False, "error": "No existe usuario con ese RUT."}), 404
    return jsonify({"ok": True, "updated": cur.rowcount})

if __name__ == "__main__":
    app.run(debug=True)
