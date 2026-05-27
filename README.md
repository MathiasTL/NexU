# Smart — Plataforma de reservas de recintos

Repositorio en proceso de migración hacia arquitectura desacoplada.

## Estructura

| Carpeta | Estado | Descripción |
|---|---|---|
| `legacy/` | ✅ Referencia | Proyecto original Next.js 15 + Oracle DB |
| `frontend/` | 🚧 En construcción | Nuevo frontend React + Vite + TypeScript |
| `backend/` | ⏳ Pendiente | Nuevo backend Python + FastAPI |

## Estado de la migración

- [x] Proyecto legacy archivado en `legacy/`
- [ ] Frontend React + Vite funcional con mock data
- [ ] Backend FastAPI con datos estáticos
- [ ] Integración frontend ↔ backend

## Levantar el proyecto legacy (referencia)

```bash
cd legacy
npm install
# Requiere Oracle Instant Client y variables de entorno configuradas
npm run dev
```

## Levantar el frontend nuevo

```bash
cd frontend
pnpm install
pnpm dev
# → http://localhost:5173
```

## Levantar el backend nuevo

```bash
cd backend
# Instrucciones en backend/README.md
```
