"""
Assignments routes.

GET    /api/v1/assignments              — lista todos los trabajos
POST   /api/v1/assignments              — crea un trabajo (requiere auth)
DELETE /api/v1/assignments/{id}         — elimina un trabajo (requiere auth)

GET    /api/v1/assignments/subject      — devuelve el nombre de la materia
PUT    /api/v1/assignments/subject      — actualiza el nombre de la materia (requiere auth)
"""
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, field_validator

from app.database import get_db, new_uuid
from app.deps import get_current_user_id

router = APIRouter(prefix="/assignments", tags=["assignments"])


# ── schemas ────────────────────────────────────────────────────────────────────

class AssignmentCreate(BaseModel):
    title: str
    filename: str
    filetype: str = "pdf"

    @field_validator("title")
    @classmethod
    def title_nonempty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("El título no puede estar vacío")
        return v

    @field_validator("filetype")
    @classmethod
    def filetype_valid(cls, v: str) -> str:
        allowed = {"pdf", "doc", "img", "zip", "xlsx", "html", "jpeg", "jpg"}
        v = v.lower().strip(".")
        # normalise common aliases
        if v in {"jpeg", "jpg"}:
            v = "img"
        if v not in allowed:
            v = "pdf"
        return v


class SubjectNameUpdate(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def name_nonempty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("El nombre de la materia no puede estar vacío")
        return v


# ── helpers ────────────────────────────────────────────────────────────────────

def _row(r: dict) -> dict:
    return {
        "id":        r["id"],
        "title":     r["title"],
        "filename":  r["filename"],
        "filetype":  r["filetype"],
        "createdAt": r["created_at"],
    }


# ── routes ─────────────────────────────────────────────────────────────────────

@router.get("/subject")
def get_subject():
    with get_db() as conn:
        row = conn.execute(
            "SELECT value FROM app_settings WHERE key = 'subject_name'"
        ).fetchone()
    return {"name": row["value"] if row else "Gerencia Estratégica"}


@router.put("/subject")
def update_subject(body: SubjectNameUpdate, request: Request):
    get_current_user_id(request)   # must be logged in
    with get_db() as conn:
        conn.execute(
            "INSERT INTO app_settings (key, value) VALUES ('subject_name', ?) "
            "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            (body.name,),
        )
    return {"name": body.name}


@router.get("")
def list_assignments():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM assignments ORDER BY created_at ASC"
        ).fetchall()
    return {"assignments": [_row(dict(r)) for r in rows]}


@router.post("", status_code=201)
def create_assignment(body: AssignmentCreate, request: Request):
    get_current_user_id(request)
    aid = new_uuid()
    with get_db() as conn:
        conn.execute(
            "INSERT INTO assignments (id, title, filename, filetype) VALUES (?, ?, ?, ?)",
            (aid, body.title, body.filename, body.filetype),
        )
        row = conn.execute("SELECT * FROM assignments WHERE id = ?", (aid,)).fetchone()
    return {"assignment": _row(dict(row))}


@router.delete("/{assignment_id}")
def delete_assignment(assignment_id: str, request: Request):
    get_current_user_id(request)
    with get_db() as conn:
        row = conn.execute(
            "SELECT id FROM assignments WHERE id = ?", (assignment_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Trabajo no encontrado")
        conn.execute("DELETE FROM assignments WHERE id = ?", (assignment_id,))
    return {"message": "Trabajo eliminado"}
