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
| `backend/docs/decisiones-tecnicas.md` | Decisiones técnicas D1–D10 |
| `backend/docs/endpoints.md` | Referencia completa de endpoints API |

## Levantar el proyecto legacy (solo referencia)

```bash
cd legacy
npm install
# Requiere Oracle Instant Client y variables de entorno configuradas
npm run dev
```
