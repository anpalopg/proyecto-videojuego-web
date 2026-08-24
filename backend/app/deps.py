"""
Shared helpers used by route handlers.
"""
from fastapi import Request, HTTPException, status

from app.security import get_user_id_from_access_token
from app.database import get_db


def get_current_user_id(request: Request) -> str:
    """
    Extract the Bearer token from Authorization header, decode it and return user_id.
    Raises 401 if missing or invalid.
    """
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autorizado")
    token = auth[7:]
    user_id = get_user_id_from_access_token(token)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o expirado")
    return user_id


def require_user(request: Request) -> dict:
    """
    Like get_current_user_id but also fetches the DB row.
    Returns the user row dict or raises 401/404.
    """
    user_id = get_current_user_id(request)
    with get_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return dict(row)
