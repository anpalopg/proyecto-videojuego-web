# Recessed Minds

Landing oficial de **Recessed Minds**, un thriller psicológico de supervivencia. Construida con Astro + Preact, desplegada en Vercel y conectada a Supabase.

## Stack

| Capa | Tecnología |
|------|------------|
| Framework | Astro 5 (`output: 'server'`) |
| UI interactiva | Preact islands |
| Backend | Astro API Routes (SSR) |
| Base de datos + Auth | Supabase (PostgreSQL + GoTrue) |
| Deploy | Vercel |
| CSS | CSS nativo con custom properties |

## Requisitos

- Node.js `>= 22.12.0`
- npm
- Proyecto en [Supabase](https://supabase.com)

## Desarrollo local

```bash
git clone https://github.com/felipe-pineros/proyecto-videojuego.git
cd proyecto-videojuego/frontend
npm install
```

Crea el archivo `frontend/.env.local` con tus credenciales de Supabase:

```env
PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

Levanta el servidor de desarrollo:

```bash
npm run dev   # http://localhost:4321
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build local |

## Despliegue

El proyecto está configurado para Vercel. Cada push a `main` dispara un redeploy automático.

Para desplegar desde cero: importa el repo en [vercel.com](https://vercel.com), establece el **Root Directory** en `frontend` y añade las tres variables de entorno de Supabase.

## Estructura

```
frontend/
├── src/
│   ├── pages/
│   │   ├── index.astro          # Landing principal
│   │   ├── dashboard.astro      # Dashboard del usuario (protegido)
│   │   ├── 404.astro            # Página de error personalizada
│   │   └── api/v1/              # API routes (auth + comments)
│   ├── components/              # Astro y Preact islands
│   ├── lib/
│   │   ├── api.js               # Cliente fetch del frontend
│   │   └── supabase.ts          # Clientes Supabase + helpers
│   └── styles/
│       └── global.css
└── public/
    └── images/
```
