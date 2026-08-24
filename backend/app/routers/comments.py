"""
Comments routes — mirrors the Astro /api/v1/comments/* endpoints.

GET    /api/v1/comments          — public, cursor-based pagination
POST   /api/v1/comments          — requires auth
PATCH  /api/v1/comments/{id}     — requires auth + ownership
DELETE /api/v1/comments/{id}     — requires auth + ownership
"""
import base64
from typing import Optional

from fastapi import APIRouter, Request, HTTPException, status
from pydantic import BaseModel, field_validator

from app.database import get_db, new_uuid
from app.deps import get_current_user_id

router = APIRouter(prefix="/comments", tags=["comments"])

MAX_LIMIT = 50


# ── helpers ────────────────────────────────────────────────────────────────────

def _transform(row: dict) -> dict:
    return {
        "_id":        row["id"],
        "userId":     row["user_id"],
        "authorName": row["author_name"],
        "rating":     row["rating"],
        "content":    row["content"],
        "status":     row["status"],
        "createdAt":  row["created_at"],
        "updatedAt":  row["updated_at"],
    }


def _encode_cursor(created_at: str) -> str:
    return base64.b64encode(created_at.encode()).decode()


def _decode_cursor(cursor: str) -> str:
    return base64.b64decode(cursor.encode()).decode()


# ── schemas ────────────────────────────────────────────────────────────────────

class CommentCreate(BaseModel):
    authorName: str
    rating: int
    content: str

    @field_validator("rating")
    @classmethod
    def rating_range(cls, v: int) -> int:
        if not (1 <= v <= 5):
            raise ValueError("La puntuación debe estar entre 1 y 5")
        return v

    @field_validator("content")
    @classmethod
    def content_length(cls, v: str) -> str:
        if not (1 <= len(v) <= 1000):
            raise ValueError("El comentario debe tener entre 1 y 1000 caracteres")
        return v

    @field_validator("authorName")
    @classmethod
    def author_name_nonempty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("El nombre del autor es requerido")
        return v


class CommentUpdate(BaseModel):
    content: Optional[str] = None
    rating: Optional[int] = None

    @field_validator("rating")
    @classmethod
    def rating_range(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and not (1 <= v <= 5):
            raise ValueError("La puntuación debe estar entre 1 y 5")
        return v

    @field_validator("content")
    @classmethod
    def content_length(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not (1 <= len(v) <= 1000):
            raise ValueError("El comentario debe tener entre 1 y 1000 caracteres")
        return v


# ── routes ─────────────────────────────────────────────────────────────────────

@router.get("")
async def list_comments(
    cursor: Optional[str] = None,
    limit: int = 10,
    userId: Optional[str] = None,
):
    limit = min(limit, MAX_LIMIT)
    with get_db() as conn:
        params: list = []
        where_clauses = ["status = 'active'"]

        if userId:
            where_clauses.append("user_id = ?")
            params.append(userId)

        if cursor:
            cursor_date = _decode_cursor(cursor)
            where_clauses.append("created_at < ?")
            params.append(cursor_date)

        where = " AND ".join(where_clauses)
        rows = conn.execute(
            f"SELECT * FROM comments WHERE {where} ORDER BY created_at DESC, id DESC LIMIT ?",
            params + [limit + 1],
        ).fetchall()

    has_more = len(rows) > limit
    rows = rows[:limit]
    next_cursor = _encode_cursor(rows[-1]["created_at"]) if has_more and rows else None

    return {
        "comments": [_transform(dict(r)) for r in rows],
        "pageInfo": {"nextCursor": next_cursor, "hasMore": has_more},
    }


@router.post("", status_code=201)
async def create_comment(body: CommentCreate, request: Request):
    user_id = get_current_user_id(request)

    comment_id = new_uuid()
    with get_db() as conn:
        conn.execute(
            "INSERT INTO comments (id, user_id, author_name, rating, content) VALUES (?, ?, ?, ?, ?)",
            (comment_id, user_id, body.authorName, body.rating, body.content),
        )
        row = conn.execute("SELECT * FROM comments WHERE id = ?", (comment_id,)).fetchone()

    return {"comment": _transform(dict(row))}


@router.patch("/{comment_id}")
async def update_comment(comment_id: str, body: CommentUpdate, request: Request):
    user_id = get_current_user_id(request)

    with get_db() as conn:
        row = conn.execute("SELECT * FROM comments WHERE id = ?", (comment_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Comentario no encontrado")
        if row["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="No tienes permiso para editar este comentario")

        updates: dict[str, object] = {}
        if body.content is not None:
            updates["content"] = body.content
        if body.rating is not None:
            updates["rating"] = body.rating

        if updates:
            set_clause = ", ".join(f"{k} = ?" for k in updates)
            set_clause += ", updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')"
            conn.execute(
                f"UPDATE comments SET {set_clause} WHERE id = ?",
                list(updates.values()) + [comment_id],
            )

        updated = conn.execute("SELECT * FROM comments WHERE id = ?", (comment_id,)).fetchone()

    return {"comment": _transform(dict(updated)), "message": "Comentario actualizado"}


@router.delete("/{comment_id}")
async def delete_comment(comment_id: str, request: Request):
    user_id = get_current_user_id(request)

    with get_db() as conn:
        row = conn.execute("SELECT user_id FROM comments WHERE id = ?", (comment_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Comentario no encontrado")
        if row["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="No tienes permiso para eliminar este comentario")
        conn.execute("DELETE FROM comments WHERE id = ?", (comment_id,))

    return {"message": "Comentario eliminado"}
