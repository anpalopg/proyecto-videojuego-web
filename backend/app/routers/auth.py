"""
Auth routes — mirrors the Astro /api/v1/auth/* endpoints.

POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
GET  /api/v1/auth/me
"""
from datetime import timezone

from fastapi import APIRouter, Request, Response, HTTPException, status
from pydantic import BaseModel, EmailStr, field_validator

from app.database import get_db, new_uuid
from app.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.deps import require_user
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

COOKIE_NAME = "rm_refresh"
COOKIE_MAX_AGE = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600


# ── schemas ────────────────────────────────────────────────────────────────────

class RegisterBody(BaseModel):
    username: str
    email: EmailStr
    password: str
    confirmPassword: str

    @field_validator("username")
    @classmethod
    def username_length(cls, v: str) -> str:
        if not (3 <= len(v) <= 20):
            raise ValueError("El nombre de usuario debe tener entre 3 y 20 caracteres")
        return v

    @field_validator("password")
    @classmethod
    def password_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("La contraseña debe tener al menos 6 caracteres")
        return v


class LoginBody(BaseModel):
    email: str      # accepts username or email (matched on frontend)
    password: str


# ── helpers ────────────────────────────────────────────────────────────────────

def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=COOKIE_MAX_AGE,
        samesite="strict",
        path="/",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key=COOKIE_NAME, path="/")


def _store_refresh_token(conn, token: str, user_id: str, expires_at) -> None:
    expires_str = expires_at.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    conn.execute(
        "INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES (?, ?, ?)",
        (token, user_id, expires_str),
    )


# ── routes ─────────────────────────────────────────────────────────────────────

@router.post("/register", status_code=201)
async def register(body: RegisterBody, response: Response):
    if body.password != body.confirmPassword:
        raise HTTPException(status_code=400, detail="Las contraseñas no coinciden")

    with get_db() as conn:
        # Check username
        if conn.execute("SELECT id FROM users WHERE username = ?", (body.username,)).fetchone():
            raise HTTPException(status_code=409, detail="El nombre de usuario ya está en uso")
        # Check email
        if conn.execute("SELECT id FROM users WHERE email = ?", (body.email,)).fetchone():
            raise HTTPException(status_code=409, detail="El email ya está registrado")

        user_id = new_uuid()
        hashed = hash_password(body.password)
        conn.execute(
            "INSERT INTO users (id, username, email, hashed_pw) VALUES (?, ?, ?, ?)",
            (user_id, body.username, body.email, hashed),
        )

        access = create_access_token(user_id)
        refresh, expires_at = create_refresh_token(user_id)
        _store_refresh_token(conn, refresh, user_id, expires_at)

    _set_refresh_cookie(response, refresh)
    return {
        "accessToken": access,
        "user": {"id": user_id, "username": body.username, "email": body.email},
    }


@router.post("/login")
async def login(body: LoginBody, response: Response):
    identifier = body.email.strip()  # may be username or email
    with get_db() as conn:
        # try email first, then username — single context for the whole operation
        row = conn.execute(
            "SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1",
            (identifier, identifier),
        ).fetchone()

        if not row or not verify_password(body.password, row["hashed_pw"]):
            raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

        user = dict(row)
        access = create_access_token(user["id"])
        refresh, expires_at = create_refresh_token(user["id"])
        _store_refresh_token(conn, refresh, user["id"], expires_at)

    _set_refresh_cookie(response, refresh)
    return {
        "accessToken": access,
        "user": {"id": user["id"], "username": user["username"], "email": user["email"]},
    }


@router.post("/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get(COOKIE_NAME)
    if token:
        with get_db() as conn:
            conn.execute("DELETE FROM refresh_tokens WHERE token = ?", (token,))
    _clear_refresh_cookie(response)
    return {"message": "Sesión cerrada exitosamente"}


@router.post("/refresh")
async def refresh_session(request: Request, response: Response):
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="No hay sesión activa")

    try:
        payload = decode_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Sesión expirada, inicia sesión nuevamente")

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Token inválido")

    user_id = payload["sub"]

    with get_db() as conn:
        # Verify token is still in DB (not revoked)
        stored = conn.execute(
            "SELECT token FROM refresh_tokens WHERE token = ? AND user_id = ?",
            (token, user_id),
        ).fetchone()
        if not stored:
            raise HTTPException(status_code=401, detail="Sesión expirada, inicia sesión nuevamente")

        # Rotate refresh token
        conn.execute("DELETE FROM refresh_tokens WHERE token = ?", (token,))
        new_access = create_access_token(user_id)
        new_refresh, expires_at = create_refresh_token(user_id)
        _store_refresh_token(conn, new_refresh, user_id, expires_at)

    _set_refresh_cookie(response, new_refresh)
    return {"accessToken": new_access}


@router.get("/me")
async def me(request: Request):
    user = require_user(request)
    return {"user": {"id": user["id"], "username": user["username"], "email": user["email"]}}
