# NexU — Plataforma de alojamiento universitario

Plataforma para que estudiantes encuentren habitaciones y departamentos cerca de sus universidades en Lima, Perú, y propietarios publiquen y gestionen sus espacios.

## Estructura del repositorio

| Carpeta | Estado | Descripción |
|---|---|---|
| `legacy/` | Referencia | Proyecto original Next.js 15 + Oracle DB (solo lectura) |
| `frontend/` | Activo | React 18 + Vite 5 + TypeScript 5 |
| `backend/` | Activo | Python 3.13 + FastAPI 0.138 + Pydantic v2 |

## Estado de la migración

- [x] Proyecto legacy archivado en `legacy/`
- [x] Frontend React + Vite con mock data (Paso 1 y 2 completados)
- [x] Backend FastAPI con datos en memoria — repositorios listos para PostgreSQL
- [x] Integración frontend ↔ backend (servicios conectados al API real)
- [x] **Matching con IA** — ranking estudiante↔habitación y estudiante↔roommate con radar de compatibilidad, explicación narrativa (Groq, con fallback) y contacto entre roommates (doble opt-in)

## Matching con IA

Funcionalidad que rankea habitaciones y roommates compatibles para cada estudiante:

- **Scoring determinista** por dimensiones (universidad, presupuesto, ruido, estudio, etc.) con desglose para un **radar comparativo** (Recharts).
- **Explicación en lenguaje natural** de cada match vía un LLM (Groq, API compatible con OpenAI); si no hay API key o falla, degrada a una plantilla — el matching nunca se cae.
- **Contacto entre roommates** con doble opt-in (solicitud → aceptación) que crea una conversación in-app.
- Endpoints: `GET /api/v1/matching/properties`, `GET /api/v1/matching/roommates`, `POST /api/v1/matching/roommates/{id}/request`, `GET /api/v1/matching/requests`, `POST /api/v1/matching/requests/{id}/accept|reject`.

Configuración del LLM (opcional) en `backend/.env` — ver `backend/.env.example`:
`LLM_API_KEY_ROOMMATES` (roommates; acepta también el nombre antiguo `LLM_API_KEY`/`GROQ_API_KEY`),
`LLM_API_KEY_ROOMS` (habitaciones; si está vacío cae a la key de roommates), `LLM_BASE_URL`
(por defecto Groq) y `LLM_MODEL`. Cada dominio usa su propia key para repartir el rate limit de
Groq. Sin key en un dominio, se usa la explicación por plantilla en ese dominio.

Diseño y plan de implementación: ver la tabla de [Documentación](#documentación).

## Levantar el proyecto

### Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # Windows
# source .venv/bin/activate    # Mac/Linux
# source .venv/Scripts/activate #GitBash
pip install -r requirements.txt
uvicorn app.main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs  (Swagger UI)
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

> El frontend lee `VITE_API_BASE_URL` desde `frontend/.env.local`.
> Por defecto apunta a `http://localhost:8000/api/v1`.

## Stack técnico

**Frontend**
- React 18, Vite 5, TypeScript 5
- React Router v6, Zustand, Tailwind CSS 3, Leaflet
- Autenticación con JWT (access token 30 min + refresh token 7 días)

**Backend**
- FastAPI, Pydantic v2, python-jose, passlib[bcrypt]
- Arquitectura limpia: `api/v1 → services → repositories → mock_data`
- Repositorios en memoria, intercambiables por PostgreSQL sin cambiar la capa de servicios
- JSON en camelCase (alias_generator de Pydantic) para compatibilidad directa con TypeScript

## Documentación

| Documento | Descripción |
|---|---|
| `frontend/docs/contexto-migracion-nexu-v2.md` | Contexto completo de la migración y contratos de datos |
| `frontend/docs/integracion-backend.md` | Guía de integración frontend ↔ backend |
| `backend/docs/arquitectura.md` | Decisiones de arquitectura del backend |
| `backend/docs/decisiones-tecnicas.md` | Decisiones técnicas D1–D13 |
| `backend/docs/endpoints.md` | Referencia completa de endpoints API |
| `backend/docs/migracion-bd.md` | Esquema de tablas y plan de migración a PostgreSQL |
| `backend/docs/comparativa-oracle-vs-postgresql.md` | Comparativa tabla por tabla: Oracle legacy vs PostgreSQL NexU v2 |
| `docs/superpowers/specs/2026-07-02-ia-matching-design.md` | Diseño de la funcionalidad de matching con IA (habitación + roommate) |
| `docs/superpowers/plans/2026-07-02-ia-matching.md` | Plan de implementación por fases del matching con IA |

## Levantar el proyecto legacy (solo referencia)

```bash
cd legacy
npm install
# Requiere Oracle Instant Client y variables de entorno configuradas
npm run dev
```
