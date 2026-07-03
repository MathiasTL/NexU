# NexU — Diseño: Matching con IA (habitación + roommate)

*(Creado: 2026-07-02 — Documento de diseño / spec)*

> Este documento describe el diseño acordado para la funcionalidad de IA de NexU:
> matching de estudiante↔habitación y estudiante↔roommate, con porcentaje de
> compatibilidad, razones en lenguaje humano, explicación narrativa generada por
> un LLM (Groq, free tier) y un radar comparativo. Es el paso previo al plan de
> implementación (`writing-plans`).

---

## 1. Contexto y motivación

El proyecto migró de un legacy Next.js + Oracle (`legacy/`, plataforma genérica de
reservas) a una arquitectura React 18 + Vite (frontend) y Python 3.12 + FastAPI
(backend), reenfocada a **alojamiento universitario en Lima**. Todo lo funcional
está migrado excepto la persistencia (hoy repositorios **en memoria**, listos para
PostgreSQL) y esta funcionalidad de IA.

El backend ya modela `LifestylePreferences` por estudiante (horario de sueño,
hábitos de estudio, nivel de ruido, limpieza, política de invitados/fumar/mascotas,
universidad objetivo, presupuesto máximo). Esa es exactamente la señal que necesita
el matching.

**Hallazgo clave:** el frontend ya tiene una función de compatibilidad
estudiante↔propiedad funcionando —
`frontend/src/features/properties/utils/compatibility.ts` —
que devuelve `{ score: 0-100, reasons: string[] }` con la ponderación:
Universidad 25 · Presupuesto 25 · Ruido 15 · Estudio 15 · Mascotas 10 · Fumar 10.
Genera el badge `85% compatible` y razones como *"Cerca de PUCP · Dentro de tu
presupuesto"*. Además el plan `frontend/docs/nextu-ux-semiotica-plan-tecnico.md`
describe (Fase 5) una compatibilidad de roommates y (Fase 6) una recomendación
tipo IA aún no implementadas.

## 2. Objetivo

Construir una funcionalidad de matching con IA que:

1. Rankea **habitaciones** para un estudiante según su perfil (porta la lógica ya
   existente del frontend al backend como fuente única de verdad).
2. Rankea **roommates compatibles** (estudiante↔estudiante) — nuevo.
3. Devuelve, además del `score` total, un **desglose por dimensión** para graficar
   un **radar comparativo**.
4. Genera una **explicación en lenguaje natural** de cada match mediante un LLM
   (Groq, free tier), con degradación a texto por plantilla.
5. Permite que dos roommates compatibles **se contacten** mediante mensajería
   in-app, con consentimiento (doble opt-in).

**No-objetivos (fuera de alcance de esta iteración):**

- Migración a PostgreSQL (todo corre sobre repositorios en memoria; ver
  `backend/docs/migracion-bd.md` para cuando se decida persistir).
- Búsqueda semántica / embeddings / pgvector.
- Persistir o versionar los matches generados.

## 3. Decisiones tomadas (resumen)

| Decisión | Elección | Motivo |
|---|---|---|
| Rol de la IA | **Híbrido**: scoring determinista + LLM que explica | Testeable, barato, funciona con mock data |
| Scoring habitación | **Portar** `compatibility.ts` (TS) → `services/matching.py` | No reinventar; fuente única de verdad en backend |
| Scoring roommate | **Nuevo**, mismo patrón puntos + razones + dimensiones | Requisito Fase 5 del plan UX |
| Alcance | **Ambos**: habitación **y** roommate | Confirmado por el usuario |
| Radar | **Recharts** (`<RadarChart>`) en frontend | No hay librería de charts hoy; Recharts es declarativa y encaja con React 18 + Tailwind |
| Motor de explicación | **Groq (free tier)** vía API compatible con OpenAI | Sin costo dentro del free tier; sin hardware propio |
| Backend LLM intercambiable | `ai_explainer` desacoplado (base_url configurable) | Poder cambiar a Ollama/Gemini sin tocar la lógica |
| Contacto roommate | **Doble opt-in** (solicitud → aceptación), en 2 fases | Privacidad; reutiliza mensajería + notificaciones |
| Captura de preferencias | **Onboarding tras registro** | Garantiza que todo estudiante tenga datos que analizar |
| Datos mock | **Ampliar** `mock_data/users.py` a ~15–20 estudiantes | Sin volumen no se puede demostrar roommate-matching |
| Base de datos | **No migrar aún** | Corre sobre repositorios en memoria |

## 4. Arquitectura

Se respeta la arquitectura limpia existente (`api/v1 → services → repositories`).
La IA se añade como **dos servicios nuevos**, sin tocar la capa de repositorios.

```
api/v1/matching.py
  ├── services/matching.py       (scoring determinista, puro, sin IO — testeable)
  └── services/ai_explainer.py   (explicación narrativa vía Groq; aislado + fallback)
        └── cliente OpenAI-compatible → base_url de Groq (config)
```

### 4.1 `services/matching.py` — el cerebro (determinista)

Funciones puras, sin IO ni red. Reutilizables y testeables de forma determinista.

- `score_property(student, property) -> MatchResult`
  Porta la ponderación de `compatibility.ts`
  (Universidad 25 · Presupuesto 25 · Ruido 15 · Estudio 15 · Mascotas 10 · Fumar 10).
  Devuelve `score` (0–100), `reasons: list[str]` y `dimensions: dict[str, int]`.

- `score_roommate(student_a, student_b) -> MatchResult`
  Nuevo. Compara `LifestylePreferences` entre dos estudiantes por dimensión de
  convivencia (sueño, ruido, limpieza, estudio, invitados, fumar, mascotas, misma
  universidad). Devuelve `score`, `reasons` y `dimensions` por eje.

`MatchResult` (dataclass / modelo Pydantic):

```python
class MatchResult:
    score: int                    # 0–100
    reasons: list[str]            # razones en lenguaje humano
    dimensions: dict[str, int]    # sub-score por eje (para el radar), 0–100 c/u
```

El desglose `dimensions` es lo que alimenta el radar; el `score` total es un
promedio ponderado de esos ejes.

### 4.2 `services/ai_explainer.py` — la voz (Groq)

- Recibe un `MatchResult` (ya rankeado) y genera la explicación narrativa
  (*"Esta habitación encaja contigo porque respeta tus horarios de silencio y está
  a 10 min de la PUCP, dentro de tu presupuesto."*).
- Integración vía **cliente compatible con OpenAI** apuntando al `base_url` de Groq
  (`https://api.groq.com/openai/v1`). Modelo configurable (p. ej.
  `llama-3.1-8b-instant` para velocidad, o `llama-3.3-70b-versatile` para calidad).
- Configuración por `pydantic-settings` en `app/config.py`:
  `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`. Cambiar a Ollama/Gemini es solo
  cambiar estas variables.
- **Fallback obligatorio:** si no hay API key, falla la llamada o se supera el
  rate limit, devuelve las `reasons` deterministas unidas como texto plantilla.
  El matching **nunca** se cae por la capa de IA.

### 4.3 Endpoints — `api/v1/matching.py`

- `GET /matching/properties` — habitaciones rankeadas para el estudiante autenticado.
- `GET /matching/roommates` — estudiantes compatibles para el autenticado.
- `POST /matching/roommates/{id}/connect` — inicia el contacto (ver §4.5).

Respuesta de match (esquema Pydantic, camelCase por alias para el frontend):

```jsonc
{
  "target": { /* PropertyResponse o AuthUserResponse resumido */ },
  "score": 85,
  "reasons": ["Cerca de PUCP", "Dentro de tu presupuesto", "Espacio sin humo"],
  "dimensions": { "universidad": 100, "presupuesto": 90, "ruido": 75, "...": 0 },
  "explanation": "Esta habitación encaja contigo porque..."
}
```

### 4.4 Frontend — radar comparativo

- Nueva dependencia: **Recharts**.
- **Roommate (radar comparativo de 2 series):** superpone el perfil del estudiante
  autenticado vs. el del candidato sobre los ejes de convivencia
  **Sueño · Ruido · Limpieza · Estudio · Invitados · Fumar · Mascotas**. Es el caso
  natural del radar, porque ambos perfiles son comparables (mismos ejes).
- **Habitación (radar de 1 serie):** aquí `dimensions` no es un perfil comparable
  sino la **contribución por criterio al score** (Universidad, Presupuesto, Ruido,
  Estudio, Mascotas, Fumar). Se muestra como radar de una sola serie (qué tan bien
  la propiedad cumple cada criterio), no como superposición de dos perfiles.
- El frontend deja de calcular la compatibilidad localmente
  (`compatibility.ts`) y consume `GET /matching/*` para que el número sea único y
  consistente con el backend. `compatibility.ts` queda deprecado/eliminado tras la
  integración.

### 4.5 Contacto entre roommates (mensajería)

Reutiliza el módulo de conversaciones/notificaciones ya migrado. Dos huecos a cubrir:

1. `Conversation.property_id` pasa a ser **opcional** (una conversación de roommates
   no requiere propiedad).
2. Nuevo endpoint para **crear** una conversación (hoy solo se puede enviar mensajes
   a una existente).

**Flujo doble opt-in, entregado en dos fases:**

- **Fase 1 (MVP):** `POST /matching/roommates/{id}/connect` crea la conversación al
  instante y notifica al otro estudiante. Contacto directo, reutiliza mensajería +
  notificaciones tal cual. No bloquea el prototipo de IA.
- **Fase 2:** se añade una capa de **solicitud → aceptación** con estado
  `pending`/`accepted`. La solicitud es una notificación; al aceptar se crea la
  conversación. Evita mensajes no deseados y respeta la privacidad.

### 4.6 Captura de preferencias (onboarding)

Hoy el registro (`RegisterRequest`) captura solo identidad + rol; las
`LifestylePreferences` se llenan después vía `PATCH /users/{id}/preferences`. Un
estudiante recién registrado tiene `lifestyle_preferences = None` y **no se puede
matchear**.

- Se añade un **paso de onboarding tras el registro** que invoca el endpoint
  existente `PATCH /users/{id}/preferences`. Garantiza que todo estudiante tenga
  datos.
- **Gate en backend:** un estudiante sin preferencias que pida matching recibe
  `409` con mensaje "completa tu perfil" (no un match vacío silencioso).

### 4.7 Datos mock

`mock_data/users.py` se amplía de 3 a **~15–20 usuarios** (mayoría estudiantes con
`LifestylePreferences` variadas y distintas universidades), para que el
roommate-matching tenga casos interesantes que demostrar. No requiere BD.

## 5. Manejo de errores

- Estudiante sin preferencias → `409` "completa tu perfil".
- Fallo/rate-limit del LLM o sin API key → fallback a texto plantilla; se loguea;
  no rompe la respuesta.
- Sin candidatos → lista vacía con mensaje, no error.

## 6. Testing

- `tests/test_matching.py` — casos **deterministas** del scoring: compatibles,
  incompatibles, presupuesto excedido, distinta universidad, dimensiones correctas
  para el radar. Cubre `score_property` y `score_roommate`.
- `ai_explainer` — se testea con el cliente LLM **mockeado**: se verifica que arma
  bien el prompt y que respeta el fallback a plantilla cuando el cliente falla o no
  hay API key.
- Se sigue el patrón por dominio ya presente en `backend/tests/`.

## 7. Dependencias nuevas

- **Backend:** `openai` (cliente compatible usado contra el `base_url` de Groq).
  El scoring es stdlib puro, sin dependencias.
- **Frontend:** `recharts` (radar).
- **Ninguna** dependencia de base de datos en esta iteración.

## 8. Fases de entrega sugeridas

1. **Scoring backend** — portar `score_property`, crear `score_roommate`, endpoints
   `GET /matching/*`, tests deterministas. (Determinista, sin IA, sin costo.)
2. **Datos mock** — ampliar `mock_data/users.py` a ~15–20 estudiantes.
3. **Onboarding + gate** — paso de preferencias tras registro; `409` sin perfil.
4. **Explicación IA** — `ai_explainer` con Groq + fallback a plantilla.
5. **Radar (frontend)** — integrar Recharts; consumir `GET /matching/*`; deprecar
   `compatibility.ts`.
6. **Contacto roommate F1** — `property_id` opcional, crear conversación,
   `POST .../connect` directo + notificación.
7. **Contacto roommate F2** — capa de solicitud/aceptación (doble opt-in).
