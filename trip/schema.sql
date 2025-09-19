DROP TABLE IF EXISTS people;

CREATE TABLE people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    rut TEXT NOT NULL UNIQUE,
    birthdate TEXT NOT NULL,   -- YYYY-MM-DD
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
