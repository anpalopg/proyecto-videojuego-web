"""
FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import auth, comments, assignments

app = FastAPI(
    title="Recessed Minds API",
    description="Backend for Recessed Minds landing + GameStore frontend",
    version="1.0.0",
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,        # needed for HttpOnly cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Startup ────────────────────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    init_db()


# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(auth.router,        prefix="/api/v1")
app.include_router(comments.router,    prefix="/api/v1")
app.include_router(assignments.router, prefix="/api/v1")


# ── Health check ───────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok"}
