# EduAdapt — Tutor pedagógico con IA

Tutor adaptativo para Grado 7° (Tecnología e Informática). Docentes gestionan clases en Supabase; estudiantes entran anónimos con código de clase + código Explora-TIC.

## Stack

| Capa | Tecnología |
|------|------------|
| Framework | TanStack Start + React 19 |
| Runtime | Bun (local) / Cloudflare Workers |
| IA | Vercel AI SDK + Google Gemini 3.6 Flash |
| Datos | Supabase (Auth docentes + Postgres) |
| UI | Tailwind CSS v4 |

## Arranque local

```bash
bun install
cp .env.example .env
# Completa SUPABASE_* y GOOGLE_GENERATIVE_AI_API_KEY
# Para el cliente también VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY

# Aplica migraciones en tu proyecto Supabase (SQL editor o CLI):
#   supabase/migrations/001_init.sql
#   supabase/migrations/002_seed_lessons.sql
#   supabase/migrations/003_anonymous_codes_and_tutor_profile.sql

bun run dev
```

## Roles

1. **Docente** → `/docente/login`
   - Crea clase, copia `join_code`, carga **códigos anónimos** (Explora-TIC: 003, 014…), pega el **perfil pedagógico** por código, activa lecciones.
2. **Estudiante** → `/estudiante`
   - Código de clase + código de estudiante → lecciones + chat.
   - El tutor recibe el prompt maestro + el párrafo de perfil de ese código (en cada mensaje).

## Migraciones Supabase

Ejecuta en orden en el SQL Editor:

1. `001_init.sql`
2. `002_seed_lessons.sql`
3. `003_anonymous_codes_and_tutor_profile.sql`

## Estructura

```
src/
  routes/           # shells + API handlers
  features/         # UI estudiante / docente
  server/           # auth, db, ai (solo servidor)
  shared/           # tipos, utils, componentes compartidos
supabase/migrations/
```

## Variables

Ver `.env.example` y `.dev.vars.example`. Nunca subas `.env` ni la service role key.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `bun run dev` | Desarrollo |
| `bun run build` | Build producción |
| `bun run lint` | ESLint |

## Producción (Cloudflare)

Configura secretos Wrangler: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`. Las `VITE_*` se inyectan en el build.

## Licencia

Proyecto académico — Universidad de Córdoba.
