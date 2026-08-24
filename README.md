# Recessed Minds — Proyecto Videojuego

Monorepo con tres partes:

| Carpeta | Stack | Puerto |
|---|---|---|
| `backend/` | Python · FastAPI · SQLite | `8000` |
| `frontend/` | Astro · Preact · CSS | `4321` |
| `store-frontend/` | React · Vite · Ant Design | `5173` |

---

## Arquitectura

```
┌─────────────────────┐     ┌──────────────────────────┐
│  frontend/          │────▶│  backend/  (Python)       │
│  Astro (static)     │     │  FastAPI + SQLite          │
│  localhost:4321     │     │  localhost:8000            │
└─────────────────────┘     │                           │
                             │  /api/v1/auth/*           │
┌─────────────────────┐     │  /api/v1/comments/*       │
│  store-frontend/    │────▶│                           │
│  React + Ant Design │     └──────────────────────────┘
│  localhost:5173     │
└─────────────────────┘
```

El `backend/` reemplaza Supabase: usa **SQLite local** (archivo `recessed_minds.db`),
**JWT** para autenticación y **HTTP-only cookies** para el refresh token.

---

## Requisitos previos

- **Python** 3.11 o superior
- **Node.js** 22.12.0 o superior
- **npm** incluido con Node

---

## 1. Backend Python (FastAPI)

```bash
cd backend

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate        # macOS / Linux
# .\venv\Scripts\activate       # Windows

# Instalar dependencias
pip install -r requirements.txt

# Copiar y ajustar .env
cp .env.example .env
# Editar .env: cambiar SECRET_KEY por una cadena aleatoria larga

# Iniciar el servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

El servidor levanta en **http://localhost:8000**.
Documentación interactiva: **http://localhost:8000/docs**

### Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | — | Crear cuenta |
| `POST` | `/api/v1/auth/login` | — | Iniciar sesión (username o email) |
| `POST` | `/api/v1/auth/logout` | cookie | Cerrar sesión |
| `POST` | `/api/v1/auth/refresh` | cookie | Renovar access token |
| `GET` | `/api/v1/auth/me` | Bearer | Datos del usuario actual |
| `GET` | `/api/v1/comments` | — | Listar comentarios (paginado) |
| `POST` | `/api/v1/comments` | Bearer | Publicar comentario |
| `PATCH` | `/api/v1/comments/{id}` | Bearer | Editar comentario propio |
| `DELETE` | `/api/v1/comments/{id}` | Bearer | Eliminar comentario propio |

---

## 2. Frontend Astro (landing del juego)

```bash
cd frontend
npm install
npm run dev      # http://localhost:4321
```

El frontend Astro es **100 % estático** — no necesita servidor Node.
Llama al backend Python en `http://localhost:8000/api/v1` (configurable con `PUBLIC_API_BASE_URL`).

Para producción, crea `frontend/.env` (o variables de entorno en tu host):

```env
PUBLIC_API_BASE_URL=https://tu-backend.com/api/v1
```

---

## 3. Store Frontend (tienda tipo Steam)

```bash
cd store-frontend
npm install
npm run dev      # http://localhost:5173
```

**Usuarios de prueba** (no requieren backend):

| Usuario | Contraseña |
|---|---|
| `admin123` | `contraseña123` |
| `user123` | `contraseña123` |

Para conectar con el backend real, crea `store-frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

## Correr todo junto (3 terminales)

**Terminal 1 — Backend:**
```bash
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Astro landing:**
```bash
cd frontend && npm run dev
```

**Terminal 3 — React store:**
```bash
cd store-frontend && npm run dev
```

---

## Base de datos

SQLite se crea automáticamente en `backend/recessed_minds.db` al iniciar el servidor.
No hay migraciones — las tablas se crean con `CREATE TABLE IF NOT EXISTS` en el startup.

Tablas:
- `users` — id, username, email, hashed_pw, created_at
- `refresh_tokens` — token, user_id, expires_at
- `comments` — id, user_id, author_name, rating, content, status, created_at, updated_at

---

## Variables de entorno del backend

| Variable | Default | Descripción |
|---|---|---|
| `SECRET_KEY` | *(requerido)* | Clave para firmar JWT — cámbiala en producción |
| `ALGORITHM` | `HS256` | Algoritmo JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Vigencia del access token |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Vigencia del refresh token |
| `DATABASE_URL` | `sqlite:///./recessed_minds.db` | Ruta del archivo SQLite |
| `CORS_ORIGINS` | `http://localhost:4321,http://localhost:5173` | Orígenes permitidos por CORS |
