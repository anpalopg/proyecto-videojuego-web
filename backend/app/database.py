"""
SQLite database — single file, zero config.
Tables are created on startup; no migrations needed for development.
"""
import sqlite3
import uuid
from contextlib import contextmanager
from pathlib import Path

from app.config import settings

# Derive file path from DATABASE_URL  (sqlite:///./file.db)
_DB_PATH = settings.DATABASE_URL.replace("sqlite:///", "")


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(_DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


CREATE_TABLES_SQL = """
CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    username    TEXT UNIQUE NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    hashed_pw   TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    token       TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at  TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS comments (
    id          TEXT PRIMARY KEY,
    user_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    rating      INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    content     TEXT NOT NULL CHECK(length(content) BETWEEN 1 AND 1000),
    status      TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','hidden')),
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS comments_pagination
    ON comments (created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS assignments (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    filename    TEXT NOT NULL,
    filetype    TEXT NOT NULL DEFAULT 'pdf',
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS app_settings (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL
);
"""

SEED_SETTINGS_SQL = """
INSERT OR IGNORE INTO app_settings (key, value)
VALUES ('subject_name', 'Gerencia Estratégica');
"""

# Archivos reales de la carpeta trabajos/
SEED_ASSIGNMENTS = [
    ("Alcance - Steam.pdf",                                    "Alcance — Steam",                        "pdf"),
    ("Clusters_Steam DEF.html",                                "Clusters Steam DEF",                     "doc"),
    ("Pestel (1).pdf",                                         "PESTEL (versión 2)",                     "pdf"),
    ("Pestel.pdf",                                             "PESTEL",                                 "pdf"),
    ("TALLER DE ENTRADAS Y SALIDAS- (VALVE-STEAM)-GRUPO3.pdf", "Taller Entradas y Salidas — Valve/Steam","pdf"),
    ("WhatsApp Image 2026-08-23 at 12.33.59 PM.jpeg",         "Imagen de sustentación",                 "img"),
    ("alcance.pdf",                                            "Alcance del proyecto",                   "pdf"),
    ("matriz (1).pdf",                                         "Matriz (versión 2)",                     "pdf"),
    ("matriz.pdf",                                             "Matriz",                                 "pdf"),
    ("valve (1).pdf",                                          "Valve (versión 2)",                      "pdf"),
    ("valve-raci-SEND (1).xlsx",                               "Valve RACI",                             "xlsx"),
]


def init_db() -> None:
    """Called once at app startup to ensure tables exist."""
    with get_db() as conn:
        conn.executescript(CREATE_TABLES_SQL)
        conn.executescript(SEED_SETTINGS_SQL)
        # Seed assignments only if table is empty
        count = conn.execute("SELECT COUNT(*) FROM assignments").fetchone()[0]
        if count == 0:
            for filename, title, filetype in SEED_ASSIGNMENTS:
                conn.execute(
                    "INSERT INTO assignments (id, title, filename, filetype) VALUES (?, ?, ?, ?)",
                    (str(uuid.uuid4()), title, filename, filetype),
                )


def new_uuid() -> str:
    return str(uuid.uuid4())
