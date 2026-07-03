# NexU — Matching con IA: Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el matching con IA de NexU — ranking estudiante↔habitación y estudiante↔roommate con porcentaje de compatibilidad, razones, explicación narrativa (Groq) y radar comparativo.

**Architecture:** Se respeta la arquitectura limpia existente (`api/v1 → services → repositories`). El scoring es Python determinista puro (`services/matching.py`); la explicación narrativa vive aislada en `services/ai_explainer.py` (Groq vía API compatible con OpenAI, con fallback a plantilla). Todo corre sobre los repositorios en memoria — **sin base de datos**. El frontend consume los nuevos endpoints y grafica un radar con Recharts.

**Tech Stack:** Backend: Python 3.12, FastAPI, Pydantic v2, `openai` (cliente apuntando a Groq), pytest. Frontend: React 18, Vite, TypeScript, Zustand, Tailwind, `recharts`.

**Spec de referencia:** `docs/superpowers/specs/2026-07-02-ia-matching-design.md`

## Global Constraints

- **Sin base de datos** en esta iteración: todo sobre repositorios en memoria (`app/repositories/memory/`). No se agrega SQLAlchemy/asyncpg/Alembic/pgvector.
- **JSON en camelCase**: todo schema de respuesta hereda de `BaseSchema` (`app/schemas/common.py`), que aplica `alias_generator=to_camel`. Los modelos de dominio (`app/models/`) usan snake_case.
- **Arquitectura por capas**: `api/v1` (routers) → `services` (lógica) → `repositories` (datos). El scoring no hace IO. La IA está aislada tras `ai_explainer` con fallback.
- **La IA nunca rompe la respuesta**: cualquier fallo del LLM (sin API key, timeout, rate limit) degrada a texto por plantilla.
- **Dependencias nuevas**: solo `openai` (backend) y `recharts` (frontend). El scoring es stdlib puro.
- **Los commits los realiza el usuario**, no el agente. Cada tarea termina con un paso de commit que **describe** el commit a realizar; el equipo humano ejecuta `git commit`.

---

## Convención de seguimiento (trabajo en equipo)

Este plan lo pueden ejecutar varios compañeros. Para saber dónde quedó el anterior:

1. **Cada tarea** tiene una línea de estado editable:
   `**Estado:** ⬜ Pendiente | **Responsable:** ____ | **Fecha:** ____`
   Cámbiala a `🟡 En progreso` o `✅ Hecho` y pon tu nombre y la fecha al tomarla.
2. **Cada paso** usa una casilla `- [ ]`. Márcala `- [x]` al completarla y haz commit; así el siguiente sabe exactamente cuál sigue.
3. **Regla de oro:** no empieces una tarea marcada `🟡 En progreso` por otra persona sin coordinar. Las tareas dentro de una misma fase suelen depender en orden; las fases 1–2 pueden ir en paralelo con la 5 (frontend) una vez exista el contrato de la Fase 1.

**Tablero de fases** (actualízalo al cerrar cada fase):

| Fase | Descripción | Estado | Responsable |
|---|---|---|---|
| 1 | Scoring backend + endpoints | ✅ | Mathias |
| 2 | Ampliar datos mock | ✅ | Mathias |
| 3 | Onboarding + gate de preferencias | ⬜ | |
| 4 | Explicación IA (Groq + fallback) | ⬜ | |
| 5 | Radar comparativo (frontend) | ⬜ | |
| 6 | Contacto roommate — Fase 1 (directo) | ⬜ | |
| 7 | Contacto roommate — Fase 2 (doble opt-in) | ⬜ | |

---

## Estructura de archivos

**Se crean:**
- `backend/app/services/matching.py` — scoring determinista (property + roommate).
- `backend/app/services/ai_explainer.py` — explicación narrativa (Groq + fallback).
- `backend/app/schemas/matching.py` — schemas de respuesta del matching.
- `backend/app/api/v1/matching.py` — router `/matching/*`.
- `backend/tests/test_matching.py` — tests deterministas del scoring.
- `backend/tests/test_ai_explainer.py` — tests del explainer (LLM mockeado).
- `frontend/src/features/matching/` — página + componentes (radar, tarjetas).

**Se modifican:**
- `backend/app/config.py` — variables `llm_*`.
- `backend/app/api/v1/router.py` — registrar `matching.router`.
- `backend/app/mock_data/users.py` — ampliar a ~15–20 estudiantes.
- `backend/app/models/conversation.py` — `property_id` opcional.
- `backend/app/repositories/base.py` + `memory/conversation.py` — crear conversación.
- `backend/app/api/v1/users.py` (o nuevo `matching.py`) — endpoint de contacto.
- `backend/requirements.txt` + `pyproject.toml` — dependencia `openai`.
- `frontend/package.json` — dependencia `recharts`.

---

# FASE 1 — Scoring backend + endpoints

## Task 1: Motor de scoring estudiante↔habitación

**Estado:** ✅ Hecho (implementado y revisado; commit pendiente del usuario) | **Responsable:** Mathias | **Fecha:** 2026-07-02

**Files:**
- Create: `backend/app/services/matching.py`
- Test: `backend/tests/test_matching.py`

**Interfaces:**
- Consumes: `app.models.user.LifestylePreferences`, `app.models.property.Property`.
- Produces:
  - `ScoreBreakdown` (dataclass): `score: int`, `reasons: list[str]`, `dimensions: dict[str, int]`.
  - `score_property(prefs: LifestylePreferences, prop: Property) -> ScoreBreakdown`.

- [x] **Step 1: Escribir el test que falla**

Crea `backend/tests/test_matching.py`:

```python
"""
Tests deterministas del motor de scoring (estudiante↔habitación y roommate).
No usan red ni el LLM: solo funciones puras de app.services.matching.
"""
from __future__ import annotations
from app.models.user import LifestylePreferences
from app.models.property import Property
from app.services.matching import score_property


def _prefs(**over) -> LifestylePreferences:
    base = dict(
        sleep_schedule="early", study_habits="intense", noise_level="quiet",
        cleanliness="strict", guests_policy="occasionally", smoking_policy="no",
        pets_policy="no", target_university="PUCP", max_monthly_budget=800.0,
    )
    base.update(over)
    return LifestylePreferences(**base)


def _prop(**over) -> Property:
    base = dict(
        id=1, host_id=2, title="T", description="D", short_description="S",
        room_type="room", price_per_month=550.0, price_per_night=0.0, currency="PEN",
        location="L", district="San Miguel", city="Lima", country="Perú",
        lat=-12.0, lng=-77.0, images=[], amenities=["QUIET_HOURS", "WORKSPACE"],
        capacity=1, bedrooms=1, beds=1, bathrooms=1,
        checkin_time="14:00", checkout_time="12:00",
        house_rules=["No fumar dentro del departamento"],
        status="active", availability_status="available", verified_host=True,
        nearest_university="PUCP", distance_to_university_minutes=10,
        created_at="2025-08-01",
    )
    base.update(over)
    return Property(**base)


class TestScoreProperty:
    def test_perfect_match_scores_high(self):
        r = score_property(_prefs(), _prop())
        assert r.score >= 85
        assert "Cerca de PUCP" in r.reasons

    def test_over_budget_gives_no_budget_reason(self):
        r = score_property(_prefs(max_monthly_budget=400.0), _prop(price_per_month=900.0))
        assert "Dentro de tu presupuesto" not in r.reasons

    def test_score_capped_at_100(self):
        r = score_property(_prefs(), _prop())
        assert 0 <= r.score <= 100

    def test_dimensions_present_for_radar(self):
        r = score_property(_prefs(), _prop())
        for axis in ("universidad", "presupuesto", "ruido", "estudio", "mascotas", "fumar"):
            assert axis in r.dimensions
            assert 0 <= r.dimensions[axis] <= 100
```

- [x] **Step 2: Correr el test y verificar que falla**

Run: `cd backend && python -m pytest tests/test_matching.py -v`
Expected: FAIL con `ModuleNotFoundError: No module named 'app.services.matching'`.

- [x] **Step 3: Implementar el scoring de propiedad**

Crea `backend/app/services/matching.py`:

```python
"""
Motor de compatibilidad determinista (sin IO, sin LLM).

Portado de frontend/src/features/properties/utils/compatibility.ts como
fuente única de verdad del backend. Devuelve score 0-100, razones en lenguaje
humano y un desglose por dimensión para el radar comparativo.
"""
from __future__ import annotations
from dataclasses import dataclass
from app.models.user import LifestylePreferences
from app.models.property import Property


@dataclass(frozen=True)
class ScoreBreakdown:
    score: int
    reasons: list[str]
    dimensions: dict[str, int]  # eje -> 0..100 (para el radar)


def _pct(points: float, maximum: float) -> int:
    if maximum <= 0:
        return 0
    return max(0, min(100, round(points / maximum * 100)))


def score_property(prefs: LifestylePreferences, prop: Property) -> ScoreBreakdown:
    reasons: list[str] = []
    amenities = prop.amenities

    # Universidad (25)
    uni_pts = 0.0
    if prefs.target_university and prop.nearest_university == prefs.target_university:
        uni_pts = 25.0
        reasons.append(f"Cerca de {prefs.target_university}")
    elif prop.distance_to_university_minutes <= 10:
        uni_pts = 10.0

    # Presupuesto (25)
    budget_pts = 0.0
    if prefs.max_monthly_budget > 0 and prop.price_per_month <= prefs.max_monthly_budget:
        margin = (prefs.max_monthly_budget - prop.price_per_month) / prefs.max_monthly_budget
        budget_pts = round(25 * min(1.0, margin + 0.5))
        reasons.append("Dentro de tu presupuesto")

    # Ruido (15)
    noise_pts = 0.0
    if prefs.noise_level == "quiet" and "QUIET_HOURS" in amenities:
        noise_pts = 15.0
        reasons.append("Horario de silencio incluido")
    elif prefs.noise_level == "lively" and "QUIET_HOURS" not in amenities:
        noise_pts = 10.0
    elif prefs.noise_level == "moderate":
        noise_pts = 8.0

    # Estudio (15)
    study_pts = 0.0
    if prefs.study_habits == "intense" and "WORKSPACE" in amenities:
        study_pts = 15.0
        reasons.append("Escritorio de estudio disponible")
    elif prefs.study_habits != "":
        study_pts = 5.0

    # Mascotas (10)
    pets_pts = 0.0
    if prefs.pets_policy == "yes" and "PETS_ALLOWED" in amenities:
        pets_pts = 10.0
        reasons.append("Mascotas permitidas")
    elif prefs.pets_policy == "no" and "PETS_ALLOWED" not in amenities:
        pets_pts = 10.0

    # Fumar (10)
    smoke_pts = 0.0
    no_smoke = any("fumar" in r.lower() for r in prop.house_rules)
    if prefs.smoking_policy == "no" and no_smoke:
        smoke_pts = 10.0
        reasons.append("Espacio sin humo")
    elif prefs.smoking_policy != "no":
        smoke_pts = 5.0

    total = min(100, round(uni_pts + budget_pts + noise_pts + study_pts + pets_pts + smoke_pts))
    dimensions = {
        "universidad": _pct(uni_pts, 25),
        "presupuesto": _pct(budget_pts, 25),
        "ruido": _pct(noise_pts, 15),
        "estudio": _pct(study_pts, 15),
        "mascotas": _pct(pets_pts, 10),
        "fumar": _pct(smoke_pts, 10),
    }
    return ScoreBreakdown(score=total, reasons=reasons, dimensions=dimensions)
```

- [x] **Step 4: Correr el test y verificar que pasa**

Run: `cd backend && python -m pytest tests/test_matching.py -v`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit** (lo ejecuta el equipo humano)

```bash
git add backend/app/services/matching.py backend/tests/test_matching.py
git commit -m "feat(matching): scoring determinista estudiante-habitacion portado de compatibility.ts"
```

---

## Task 2: Motor de scoring roommate↔roommate

**Estado:** ✅ Hecho (implementado y revisado; commit pendiente del usuario) | **Responsable:** Mathias | **Fecha:** 2026-07-02

**Files:**
- Modify: `backend/app/services/matching.py`
- Test: `backend/tests/test_matching.py`

**Interfaces:**
- Consumes: `app.models.user.LifestylePreferences`, `ScoreBreakdown` (Task 1).
- Produces: `score_roommate(a: LifestylePreferences, b: LifestylePreferences) -> ScoreBreakdown`.
  Ejes de `dimensions`: `sueño, ruido, limpieza, estudio, invitados, fumar, mascotas`.

- [x] **Step 1: Escribir el test que falla**

Añade a `backend/tests/test_matching.py`:

```python
from app.services.matching import score_roommate


class TestScoreRoommate:
    def test_identical_profiles_score_100(self):
        p = _prefs()
        r = score_roommate(p, p)
        assert r.score == 100

    def test_opposite_profiles_score_low(self):
        a = _prefs(sleep_schedule="early", noise_level="quiet", cleanliness="strict",
                   guests_policy="never", smoking_policy="no", pets_policy="no")
        b = _prefs(sleep_schedule="night", noise_level="lively", cleanliness="relaxed",
                   guests_policy="often", smoking_policy="yes", pets_policy="yes")
        r = score_roommate(a, b)
        assert r.score <= 20

    def test_radar_axes_present(self):
        r = score_roommate(_prefs(), _prefs())
        for axis in ("sueño", "ruido", "limpieza", "estudio", "invitados", "fumar", "mascotas"):
            assert axis in r.dimensions
```

- [x] **Step 2: Correr el test y verificar que falla**

Run: `cd backend && python -m pytest tests/test_matching.py::TestScoreRoommate -v`
Expected: FAIL con `ImportError: cannot import name 'score_roommate'`.

- [x] **Step 3: Implementar el scoring de roommate**

Añade a `backend/app/services/matching.py`:

```python
# Pesos por eje de convivencia (suman 100)
_ROOMMATE_WEIGHTS = {
    "sueño": ("sleep_schedule", 15),
    "ruido": ("noise_level", 20),
    "limpieza": ("cleanliness", 20),
    "estudio": ("study_habits", 10),
    "invitados": ("guests_policy", 10),
    "fumar": ("smoking_policy", 15),
    "mascotas": ("pets_policy", 10),
}

_ROOMMATE_REASONS = {
    "sueño": "Horarios de sueño compatibles",
    "ruido": "Mismo nivel de ruido preferido",
    "limpieza": "Mismos estándares de limpieza",
    "estudio": "Hábitos de estudio compatibles",
    "invitados": "Misma política de invitados",
    "fumar": "Misma política de fumar",
    "mascotas": "Misma política de mascotas",
}


def score_roommate(a: LifestylePreferences, b: LifestylePreferences) -> ScoreBreakdown:
    reasons: list[str] = []
    dimensions: dict[str, int] = {}
    total = 0.0

    for axis, (field, weight) in _ROOMMATE_WEIGHTS.items():
        va = getattr(a, field)
        vb = getattr(b, field)
        match = bool(va) and va == vb
        pts = weight if match else 0.0
        total += pts
        dimensions[axis] = 100 if match else 0
        if match:
            reasons.append(_ROOMMATE_REASONS[axis])

    return ScoreBreakdown(score=round(total), reasons=reasons, dimensions=dimensions)
```

- [x] **Step 4: Correr el test y verificar que pasa**

Run: `cd backend && python -m pytest tests/test_matching.py -v`
Expected: PASS (7 tests en total).

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/matching.py backend/tests/test_matching.py
git commit -m "feat(matching): scoring determinista roommate-roommate con desglose por eje"
```

---

## Task 3: Schemas de respuesta del matching

**Estado:** ✅ Hecho (implementado y revisado; commit pendiente del usuario) | **Responsable:** Mathias | **Fecha:** 2026-07-02

**Files:**
- Create: `backend/app/schemas/matching.py`

**Interfaces:**
- Consumes: `BaseSchema` (`app.schemas.common`), `PropertyResponse` (`app.schemas.property`), `AuthUserResponse` (`app.schemas.user`).
- Produces:
  - `PropertyMatchResponse`: `property: PropertyResponse`, `score: int`, `reasons: list[str]`, `dimensions: dict[str, int]`, `explanation: str`.
  - `RoommateMatchResponse`: `user: AuthUserResponse`, `score: int`, `reasons: list[str]`, `dimensions: dict[str, int]`, `explanation: str`.

- [x] **Step 1: Crear los schemas**

Crea `backend/app/schemas/matching.py`:

```python
from __future__ import annotations
from app.schemas.common import BaseSchema
from app.schemas.property import PropertyResponse
from app.schemas.user import AuthUserResponse


class PropertyMatchResponse(BaseSchema):
    property: PropertyResponse
    score: int
    reasons: list[str]
    dimensions: dict[str, int]
    explanation: str


class RoommateMatchResponse(BaseSchema):
    user: AuthUserResponse
    score: int
    reasons: list[str]
    dimensions: dict[str, int]
    explanation: str
```

- [x] **Step 2: Verificar que importa sin errores**

Run: `cd backend && python -c "from app.schemas.matching import PropertyMatchResponse, RoommateMatchResponse; print('ok')"`
Expected: imprime `ok`.

- [ ] **Step 3: Commit**

```bash
git add backend/app/schemas/matching.py
git commit -m "feat(matching): schemas de respuesta PropertyMatch y RoommateMatch"
```

---

## Task 4: Servicio de matching (orquesta scoring + explicación stub)

**Estado:** ✅ Hecho (implementado y revisado; commit pendiente del usuario) | **Responsable:** Mathias | **Fecha:** 2026-07-02

**Files:**
- Modify: `backend/app/services/matching.py`
- Test: `backend/tests/test_matching.py`

**Interfaces:**
- Consumes: `UserRepository`, `PropertyRepository`, `ReviewRepository` (`app.repositories.base`); `score_property`, `score_roommate`; `PropertyService._enrich` para armar `PropertyResponse`.
- Produces: `MatchingService` con:
  - `rank_properties(user_id: int) -> list[PropertyMatchResponse]`
  - `rank_roommates(user_id: int) -> list[RoommateMatchResponse]`
  - lanza `conflict(...)` si el usuario no tiene `lifestyle_preferences`.
- En esta tarea `explanation` se rellena con las `reasons` unidas (`" · "`). La Fase 4 lo reemplaza por Groq.

- [x] **Step 1: Escribir el test que falla**

Añade a `backend/tests/test_matching.py`:

```python
import pytest
from fastapi import HTTPException
from app.services.matching import MatchingService
from app.repositories.memory import (
    MemoryUserRepository, MemoryPropertyRepository, MemoryReviewRepository,
)
from app.mock_data import USERS, PROPERTIES, REVIEWS


def _service() -> MatchingService:
    return MatchingService(
        MemoryUserRepository(USERS),
        MemoryPropertyRepository(PROPERTIES),
        MemoryReviewRepository(REVIEWS),
    )


class TestMatchingService:
    def test_rank_properties_sorted_desc(self):
        matches = _service().rank_properties(user_id=1)  # Ana, PUCP
        scores = [m.score for m in matches]
        assert scores == sorted(scores, reverse=True)

    def test_rank_properties_explanation_falls_back_to_reasons(self):
        matches = _service().rank_properties(user_id=1)
        top = matches[0]
        assert top.explanation  # no vacío
        for reason in top.reasons:
            assert reason in top.explanation

    def test_user_without_preferences_conflicts(self):
        with pytest.raises(HTTPException) as exc:
            _service().rank_roommates(user_id=2)  # Carlos (host) sin preferences
        assert exc.value.status_code == 409

    def test_rank_roommates_excludes_self(self):
        matches = _service().rank_roommates(user_id=1)
        assert all(m.user.id != 1 for m in matches)
```

- [x] **Step 2: Correr el test y verificar que falla**

Run: `cd backend && python -m pytest tests/test_matching.py::TestMatchingService -v`
Expected: FAIL con `ImportError: cannot import name 'MatchingService'`.

- [x] **Step 3: Implementar el servicio**

Añade a `backend/app/services/matching.py` (imports arriba, clase al final):

```python
from app.repositories.base import UserRepository, PropertyRepository, ReviewRepository
from app.services.property import _enrich as _enrich_property
from app.schemas.matching import PropertyMatchResponse, RoommateMatchResponse
from app.schemas.user import AuthUserResponse, LifestylePreferencesSchema
from app.core.exceptions import conflict


def _fallback_explanation(reasons: list[str]) -> str:
    if not reasons:
        return "Compatibilidad calculada según tu perfil de convivencia."
    return " · ".join(reasons)


def _auth_user(user) -> AuthUserResponse:
    prefs = None
    if user.lifestyle_preferences:
        p = user.lifestyle_preferences
        prefs = LifestylePreferencesSchema(
            sleep_schedule=p.sleep_schedule, study_habits=p.study_habits,
            noise_level=p.noise_level, cleanliness=p.cleanliness,
            guests_policy=p.guests_policy, smoking_policy=p.smoking_policy,
            pets_policy=p.pets_policy, target_university=p.target_university,
            max_monthly_budget=p.max_monthly_budget,
        )
    return AuthUserResponse(
        id=user.id, email=user.email, first_name=user.first_name,
        last_name=user.last_name, role=user.role, avatar_url=user.avatar_url,
        phone=user.phone, bio=user.bio, created_at=user.created_at,
        lifestyle_preferences=prefs,
    )


class MatchingService:
    def __init__(
        self,
        user_repo: UserRepository,
        prop_repo: PropertyRepository,
        review_repo: ReviewRepository,
    ) -> None:
        self._users = user_repo
        self._props = prop_repo
        self._reviews = review_repo

    def _require_prefs(self, user_id: int):
        user = self._users.get_by_id(user_id)
        if user is None:
            raise conflict("Usuario no encontrado")
        if user.lifestyle_preferences is None:
            raise conflict("Completa tu perfil de convivencia para ver matches")
        return user

    def rank_properties(self, user_id: int) -> list[PropertyMatchResponse]:
        user = self._require_prefs(user_id)
        prefs = user.lifestyle_preferences
        matches: list[PropertyMatchResponse] = []
        for prop in self._props.get_all_active():
            bd = score_property(prefs, prop)
            matches.append(PropertyMatchResponse(
                property=_enrich_property(prop, self._reviews),
                score=bd.score, reasons=bd.reasons, dimensions=bd.dimensions,
                explanation=_fallback_explanation(bd.reasons),
            ))
        matches.sort(key=lambda m: m.score, reverse=True)
        return matches

    def rank_roommates(self, user_id: int) -> list[RoommateMatchResponse]:
        user = self._require_prefs(user_id)
        prefs = user.lifestyle_preferences
        matches: list[RoommateMatchResponse] = []
        for other in self._users.get_all():
            if other.id == user_id or other.lifestyle_preferences is None:
                continue
            bd = score_roommate(prefs, other.lifestyle_preferences)
            matches.append(RoommateMatchResponse(
                user=_auth_user(other),
                score=bd.score, reasons=bd.reasons, dimensions=bd.dimensions,
                explanation=_fallback_explanation(bd.reasons),
            ))
        matches.sort(key=lambda m: m.score, reverse=True)
        return matches
```

- [x] **Step 4: Correr los tests y verificar que pasan**

Run: `cd backend && python -m pytest tests/test_matching.py -v`
Expected: PASS (todos). Nota: `test_user_without_preferences_conflicts` usa a Carlos (id=2, host sin preferences).

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/matching.py backend/tests/test_matching.py
git commit -m "feat(matching): MatchingService orquesta scoring, ranking y gate de preferencias"
```

---

## Task 5: Endpoints `/matching/*`

**Estado:** ✅ Hecho (implementado y revisado; commit pendiente del usuario) | **Responsable:** Mathias | **Fecha:** 2026-07-02

**Files:**
- Create: `backend/app/api/v1/matching.py`
- Modify: `backend/app/api/v1/router.py`
- Test: `backend/tests/test_matching.py`

**Interfaces:**
- Consumes: `MatchingService`, `get_user_repo`, `get_property_repo`, `get_review_repo`, `get_current_user_id` (`app.api.deps`).
- Produces:
  - `GET /api/v1/matching/properties` → `list[PropertyMatchResponse]`
  - `GET /api/v1/matching/roommates` → `list[RoommateMatchResponse]`

- [x] **Step 1: Escribir el test que falla**

Añade a `backend/tests/test_matching.py`:

```python
from fastapi.testclient import TestClient


class TestMatchingEndpoints:
    def test_properties_requires_auth(self, client: TestClient):
        r = client.get("/api/v1/matching/properties")
        assert r.status_code in (401, 403)

    def test_properties_ranked(self, client: TestClient, tenant_headers):
        r = client.get("/api/v1/matching/properties", headers=tenant_headers)
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 1
        assert "score" in data[0] and "dimensions" in data[0] and "explanation" in data[0]

    def test_roommates_ranked(self, client: TestClient, tenant_headers):
        r = client.get("/api/v1/matching/roommates", headers=tenant_headers)
        assert r.status_code == 200
        assert all(m["user"]["id"] != 1 for m in r.json())

    def test_host_without_prefs_gets_409(self, client: TestClient, host_headers):
        r = client.get("/api/v1/matching/roommates", headers=host_headers)
        assert r.status_code == 409
```

- [x] **Step 2: Correr el test y verificar que falla**

Run: `cd backend && python -m pytest tests/test_matching.py::TestMatchingEndpoints -v`
Expected: FAIL con 404 (ruta no registrada).

- [x] **Step 3: Crear el router**

Crea `backend/app/api/v1/matching.py`:

```python
from __future__ import annotations
from fastapi import APIRouter, Depends
from app.schemas.matching import PropertyMatchResponse, RoommateMatchResponse
from app.services.matching import MatchingService
from app.api.deps import (
    get_user_repo, get_property_repo, get_review_repo, get_current_user_id,
)
from app.repositories.base import UserRepository, PropertyRepository, ReviewRepository

router = APIRouter(prefix="/matching", tags=["matching"])


def _get_service(
    user_repo: UserRepository = Depends(get_user_repo),
    prop_repo: PropertyRepository = Depends(get_property_repo),
    review_repo: ReviewRepository = Depends(get_review_repo),
) -> MatchingService:
    return MatchingService(user_repo, prop_repo, review_repo)


@router.get("/properties", response_model=list[PropertyMatchResponse])
def match_properties(
    user_id: int = Depends(get_current_user_id),
    svc: MatchingService = Depends(_get_service),
) -> list[PropertyMatchResponse]:
    return svc.rank_properties(user_id)


@router.get("/roommates", response_model=list[RoommateMatchResponse])
def match_roommates(
    user_id: int = Depends(get_current_user_id),
    svc: MatchingService = Depends(_get_service),
) -> list[RoommateMatchResponse]:
    return svc.rank_roommates(user_id)
```

- [x] **Step 4: Registrar el router**

Modifica `backend/app/api/v1/router.py`: añade `matching` a los imports y registra su router.

```python
from app.api.v1 import auth, properties, bookings, reviews, users, host, amenities, matching
```

y luego (junto a los demás `include_router`):

```python
router.include_router(matching.router)
```

- [x] **Step 5: Correr los tests y verificar que pasan**

Run: `cd backend && python -m pytest tests/test_matching.py -v`
Expected: PASS (todos).

- [ ] **Step 6: Verificar en Swagger (opcional, manual)**

Run: `cd backend && uvicorn app.main:app --reload` y abre `http://localhost:8000/docs` — deben aparecer `GET /api/v1/matching/properties` y `.../roommates`.

- [ ] **Step 7: Commit**

```bash
git add backend/app/api/v1/matching.py backend/app/api/v1/router.py backend/tests/test_matching.py
git commit -m "feat(matching): endpoints GET /matching/properties y /matching/roommates"
```

---

# FASE 2 — Ampliar datos mock

## Task 6: Ampliar `mock_data/users.py` a ~15–20 estudiantes

**Estado:** ✅ Hecho (implementado y revisado; commit pendiente del usuario) | **Responsable:** Mathias | **Fecha:** 2026-07-02

**Files:**
- Modify: `backend/app/mock_data/users.py`
- Test: `backend/tests/test_matching.py`

**Interfaces:**
- Consumes: `User`, `LifestylePreferences` (`app.models.user`). Mantiene los ids 1–3 existentes; añade ids 4+.
- Produces: `USERS` con ≥15 usuarios, mayoría `role="tenant"` con `lifestyle_preferences` variadas (universidades PUCP/UNI/UPC/UNMSM, presupuestos y estilos distintos).

- [x] **Step 1: Escribir el test que falla**

Añade a `backend/tests/test_matching.py`:

```python
class TestMockDataVolume:
    def test_enough_students_for_roommate_matching(self):
        from app.mock_data import USERS
        tenants_with_prefs = [
            u for u in USERS if u.role == "tenant" and u.lifestyle_preferences is not None
        ]
        assert len(tenants_with_prefs) >= 12
```

- [x] **Step 2: Correr el test y verificar que falla**

Run: `cd backend && python -m pytest tests/test_matching.py::TestMockDataVolume -v`
Expected: FAIL (hoy solo hay 2 tenants con preferences).

- [x] **Step 3: Añadir estudiantes al mock**

En `backend/app/mock_data/users.py`, dentro de la lista `USERS` (después del id=3), añade ~13 usuarios `User(...)` nuevos (ids 4–16) siguiendo el patrón existente. Cada uno con `role="tenant"`, `hashed_password=_HASH`, `avatar_url` de `https://i.pravatar.cc/150?img=N`, y un `LifestylePreferences(...)` variado. Ejemplo de un registro (replicar variando valores):

```python
    User(
        id=4,
        email="diego.ramos@upc.pe",
        hashed_password=_HASH,
        first_name="Diego",
        last_name="Ramos",
        role="tenant",
        avatar_url="https://i.pravatar.cc/150?img=15",
        phone="+51 900 111 222",
        bio="Estudiante de Administración en la UPC. Ordenado y sociable.",
        created_at="2025-04-12",
        lifestyle_preferences=LifestylePreferences(
            sleep_schedule="night",
            study_habits="moderate",
            noise_level="lively",
            cleanliness="average",
            guests_policy="often",
            smoking_policy="no",
            pets_policy="no",
            target_university="UPC",
            max_monthly_budget=700.0,
        ),
    ),
```

Varía entre estos valores para cubrir casos de matching diversos:
- `sleep_schedule`: `early` | `night` | `flexible`
- `study_habits`: `intense` | `moderate` | `casual`
- `noise_level`: `quiet` | `moderate` | `lively`
- `cleanliness`: `strict` | `average` | `relaxed`
- `guests_policy`: `never` | `occasionally` | `often`
- `smoking_policy`: `no` | `outside` | `yes`
- `pets_policy`: `no` | `yes`
- `target_university`: `PUCP` | `UNI` | `UPC` | `UNMSM`
- `max_monthly_budget`: entre `500.0` y `900.0`

Crea al menos 13 registros (ids 4–16) para superar el umbral de 12 tenants con preferencias.

- [x] **Step 4: Correr toda la suite y verificar que pasa**

Run: `cd backend && python -m pytest tests/ -v`
Expected: PASS. **Atención:** revisa `tests/test_users.py` — si algún test valida un conteo exacto de usuarios, actualízalo al nuevo total. Los tests de propiedades no deberían cambiar (siguen 8 propiedades).

- [ ] **Step 5: Commit**

```bash
git add backend/app/mock_data/users.py backend/tests/test_matching.py
git commit -m "feat(mock): ampliar a ~16 usuarios con preferencias variadas para roommate-matching"
```

---

# FASE 3 — Onboarding + gate de preferencias

> **Nota:** el gate en backend (409) ya lo implementa la Fase 1 (Task 4/5). Esta fase cubre el paso de onboarding en el **frontend**: tras registro exitoso, si el estudiante no tiene preferencias, redirigirlo a un formulario que llama a `PATCH /users/{id}/preferences` (endpoint ya existente).

## Task 7: Onboarding de preferencias tras registro (frontend)

**Estado:** ⬜ Pendiente | **Responsable:** ____ | **Fecha:** ____

**Files:**
- Modify: el flujo de registro del frontend (buscar el componente/página que maneja `register`; típicamente `frontend/src/features/auth/`).
- Reutiliza el servicio de preferencias existente que llama `PATCH /users/{id}/preferences`.

**Interfaces:**
- Consumes: respuesta de registro (`AuthResponse` con `user`), servicio de auth, servicio de perfil/preferencias existente.
- Produces: tras registro, si `user.lifestylePreferences == null` y `user.role === 'tenant'`, se muestra/redirige al formulario de preferencias antes de entrar a la app.

- [ ] **Step 1: Localizar el flujo de registro**

Run: `cd frontend && grep -rn "register" src/features/auth src/services 2>/dev/null | head`
Identifica dónde se procesa la respuesta de registro y dónde se navega tras el éxito.

- [ ] **Step 2: Localizar el formulario/servicio de preferencias existente**

Run: `cd frontend && grep -rln "preferences" src | head`
Confirma el componente de edición de preferencias y el servicio que hace `PATCH .../preferences` (ya existe porque la edición de perfil funciona).

- [ ] **Step 3: Redirigir a onboarding tras registro**

En el handler de registro exitoso, tras guardar la sesión, comprueba:

```typescript
if (response.user.role === 'tenant' && !response.user.lifestylePreferences) {
  navigate('/onboarding/preferencias')  // ruta que renderiza el form de preferencias
} else {
  navigate('/')
}
```

Registra la ruta `/onboarding/preferencias` en el router del frontend, apuntando al componente de preferencias existente (reutilizado en modo "onboarding": al guardar, navega a `/`).

- [ ] **Step 4: Verificar el flujo manualmente**

Run: levantar backend (`uvicorn app.main:app --reload`) y frontend (`npm run dev`). Registrar un tenant nuevo → debe caer en `/onboarding/preferencias`. Al guardar preferencias → entra a la app y `/api/v1/matching/roommates` responde 200 (no 409).

- [ ] **Step 5: Commit**

```bash
git add frontend/src
git commit -m "feat(onboarding): pedir preferencias de convivencia tras registro de estudiante"
```

---

# FASE 4 — Explicación IA (Groq + fallback)

## Task 8: Configuración del LLM

**Estado:** ⬜ Pendiente | **Responsable:** ____ | **Fecha:** ____

**Files:**
- Modify: `backend/app/config.py`
- Modify: `backend/requirements.txt`, `backend/pyproject.toml`

**Interfaces:**
- Produces: `settings.llm_api_key`, `settings.llm_base_url`, `settings.llm_model`, `settings.llm_enabled`.

- [ ] **Step 1: Añadir la dependencia**

Añade `openai>=1.0.0` a `backend/requirements.txt` y al array `dependencies` de `backend/pyproject.toml`. Luego:

Run: `cd backend && pip install -r requirements.txt`
Expected: instala `openai` sin errores.

- [ ] **Step 2: Añadir settings del LLM**

En `backend/app/config.py`, dentro de `Settings`, añade:

```python
    llm_api_key: str = ""                                   # GROQ_API_KEY / vacío = fallback
    llm_base_url: str = "https://api.groq.com/openai/v1"
    llm_model: str = "llama-3.1-8b-instant"

    @property
    def llm_enabled(self) -> bool:
        return bool(self.llm_api_key)
```

- [ ] **Step 3: Verificar que carga**

Run: `cd backend && python -c "from app.config import settings; print(settings.llm_enabled, settings.llm_base_url)"`
Expected: imprime `False https://api.groq.com/openai/v1` (sin key → fallback activo).

- [ ] **Step 4: Documentar la variable**

Añade a `backend/.env.example` (créalo si no existe) las líneas:

```
LLM_API_KEY=
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=llama-3.1-8b-instant
```

- [ ] **Step 5: Commit**

```bash
git add backend/app/config.py backend/requirements.txt backend/pyproject.toml backend/.env.example
git commit -m "chore(llm): configuracion de Groq (base_url compatible OpenAI) con fallback"
```

---

## Task 9: `ai_explainer` con Groq + fallback a plantilla

**Estado:** ⬜ Pendiente | **Responsable:** ____ | **Fecha:** ____

**Files:**
- Create: `backend/app/services/ai_explainer.py`
- Test: `backend/tests/test_ai_explainer.py`

**Interfaces:**
- Consumes: `settings` (`app.config`); el paquete `openai`.
- Produces:
  - `explain(context: str, reasons: list[str]) -> str` — devuelve texto narrativo del LLM, o `" · ".join(reasons)` si el LLM está deshabilitado o falla.

- [ ] **Step 1: Escribir el test que falla**

Crea `backend/tests/test_ai_explainer.py`:

```python
"""
Tests del explainer: verifica el fallback a plantilla y que se llama al LLM
cuando está habilitado. El cliente LLM se mockea — no hay red real.
"""
from __future__ import annotations
from unittest.mock import patch, MagicMock
from app.services import ai_explainer


class TestFallback:
    def test_disabled_llm_returns_reasons_joined(self):
        with patch.object(ai_explainer.settings, "llm_api_key", ""):
            out = ai_explainer.explain("una habitación", ["Cerca de PUCP", "Sin humo"])
            assert out == "Cerca de PUCP · Sin humo"

    def test_llm_error_falls_back_to_reasons(self):
        with patch.object(ai_explainer.settings, "llm_api_key", "fake-key"):
            with patch.object(ai_explainer, "_client") as mk:
                mk.return_value.chat.completions.create.side_effect = RuntimeError("boom")
                out = ai_explainer.explain("una habitación", ["Cerca de PUCP"])
                assert out == "Cerca de PUCP"


class TestLLMPath:
    def test_calls_llm_when_enabled(self):
        fake = MagicMock()
        fake.chat.completions.create.return_value.choices = [
            MagicMock(message=MagicMock(content="Esta habitación encaja contigo."))
        ]
        with patch.object(ai_explainer.settings, "llm_api_key", "fake-key"):
            with patch.object(ai_explainer, "_client", return_value=fake):
                out = ai_explainer.explain("una habitación", ["Cerca de PUCP"])
                assert out == "Esta habitación encaja contigo."
                fake.chat.completions.create.assert_called_once()
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd backend && python -m pytest tests/test_ai_explainer.py -v`
Expected: FAIL con `ModuleNotFoundError: No module named 'app.services.ai_explainer'`.

- [ ] **Step 3: Implementar el explainer**

Crea `backend/app/services/ai_explainer.py`:

```python
"""
Explicación narrativa de un match mediante un LLM (Groq, API compatible con
OpenAI). Aislado tras esta función: si el LLM está deshabilitado o falla,
degrada a las razones deterministas unidas. El matching nunca se cae por aquí.
"""
from __future__ import annotations
import logging
from functools import lru_cache
from app.config import settings

logger = logging.getLogger(__name__)

_SYSTEM = (
    "Eres el asistente de NexU, una plataforma de alojamiento universitario en "
    "Lima. Explica en 1-2 frases, en español neutro y tono cercano, por qué el "
    "match es bueno. Usa solo las razones dadas; no inventes datos."
)


@lru_cache(maxsize=1)
def _client():
    from openai import OpenAI
    return OpenAI(api_key=settings.llm_api_key, base_url=settings.llm_base_url)


def _fallback(reasons: list[str]) -> str:
    if not reasons:
        return "Compatibilidad calculada según tu perfil de convivencia."
    return " · ".join(reasons)


def explain(context: str, reasons: list[str]) -> str:
    if not settings.llm_enabled:
        return _fallback(reasons)
    try:
        prompt = (
            f"Contexto: {context}. Razones de compatibilidad: "
            f"{', '.join(reasons) if reasons else 'ninguna destacada'}."
        )
        resp = _client().chat.completions.create(
            model=settings.llm_model,
            messages=[
                {"role": "system", "content": _SYSTEM},
                {"role": "user", "content": prompt},
            ],
            max_tokens=120,
            temperature=0.4,
        )
        text = (resp.choices[0].message.content or "").strip()
        return text or _fallback(reasons)
    except Exception as exc:  # noqa: BLE001 — degradar ante cualquier fallo del LLM
        logger.warning("LLM explain falló, usando fallback: %s", exc)
        return _fallback(reasons)
```

- [ ] **Step 4: Correr los tests y verificar que pasan**

Run: `cd backend && python -m pytest tests/test_ai_explainer.py -v`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/ai_explainer.py backend/tests/test_ai_explainer.py
git commit -m "feat(matching): ai_explainer con Groq y fallback a plantilla determinista"
```

---

## Task 10: Conectar el explainer al MatchingService

**Estado:** ⬜ Pendiente | **Responsable:** ____ | **Fecha:** ____

**Files:**
- Modify: `backend/app/services/matching.py`
- Test: `backend/tests/test_matching.py`

**Interfaces:**
- Consumes: `ai_explainer.explain`.
- Produces: `PropertyMatchResponse.explanation` / `RoommateMatchResponse.explanation` ahora provienen de `explain(...)`. Con LLM deshabilitado (default en tests) el resultado sigue siendo las razones unidas → los tests existentes de la Fase 1 siguen pasando.

- [ ] **Step 1: Escribir el test que falla**

Añade a `backend/tests/test_matching.py`:

```python
class TestExplainerWired:
    def test_property_match_uses_explainer(self):
        from unittest.mock import patch
        with patch("app.services.matching.explain", return_value="Texto IA de prueba") as mk:
            matches = _service().rank_properties(user_id=1)
            assert matches[0].explanation == "Texto IA de prueba"
            assert mk.called
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd backend && python -m pytest tests/test_matching.py::TestExplainerWired -v`
Expected: FAIL (aún no se importa `explain` en `matching.py`).

- [ ] **Step 3: Cablear el explainer**

En `backend/app/services/matching.py`:

1. Añade el import: `from app.services.ai_explainer import explain`.
2. En `rank_properties`, reemplaza `explanation=_fallback_explanation(bd.reasons)` por:

```python
                explanation=explain(f"la habitación '{prop.title}'", bd.reasons),
```

3. En `rank_roommates`, reemplaza el `explanation=...` por:

```python
                explanation=explain(f"el/la compañero(a) {other.first_name}", bd.reasons),
```

(Puedes eliminar `_fallback_explanation` si ya no se usa, o dejarlo — el explainer tiene su propio fallback interno.)

- [ ] **Step 4: Correr toda la suite y verificar que pasa**

Run: `cd backend && python -m pytest tests/ -v`
Expected: PASS (incluidos los tests de la Fase 1: con LLM deshabilitado, `explain` devuelve las razones unidas, que siguen conteniendo cada razón).

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/matching.py backend/tests/test_matching.py
git commit -m "feat(matching): usar ai_explainer para la explicacion narrativa de cada match"
```

---

# FASE 5 — Radar comparativo (frontend)

## Task 11: Instalar Recharts y tipos del match

**Estado:** ⬜ Pendiente | **Responsable:** ____ | **Fecha:** ____

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/src/features/matching/types.ts`

**Interfaces:**
- Produces: tipos TS `PropertyMatch`, `RoommateMatch` que reflejan los schemas del backend (camelCase).

- [ ] **Step 1: Instalar Recharts**

Run: `cd frontend && npm install recharts`
Expected: agrega `recharts` a `dependencies` en `package.json`.

- [ ] **Step 2: Crear los tipos**

Crea `frontend/src/features/matching/types.ts`:

```typescript
import type { Property } from '@/features/properties/types/property.types'
import type { AuthUser } from '@/features/account/types/account.types'

export interface PropertyMatch {
  property: Property
  score: number
  reasons: string[]
  dimensions: Record<string, number>
  explanation: string
}

export interface RoommateMatch {
  user: AuthUser
  score: number
  reasons: string[]
  dimensions: Record<string, number>
  explanation: string
}
```

> Nota: ajusta las rutas de import de `Property` y `AuthUser` a como estén nombradas en el proyecto (verifícalo con `grep -rn "export interface Property" frontend/src` y equivalente para el usuario).

- [ ] **Step 3: Verificar el build de tipos**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin errores (o solo los preexistentes ajenos a estos archivos).

- [ ] **Step 4: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/src/features/matching/types.ts
git commit -m "chore(frontend): instalar recharts y tipos de match"
```

---

## Task 12: Componente de radar comparativo

**Estado:** ⬜ Pendiente | **Responsable:** ____ | **Fecha:** ____

**Files:**
- Create: `frontend/src/features/matching/components/CompatibilityRadar.tsx`

**Interfaces:**
- Consumes: `recharts`.
- Produces: `<CompatibilityRadar dimensions={...} compareDimensions={...} labelA labelB />`.
  - Una serie si solo `dimensions` (caso habitación); dos series si además `compareDimensions` (caso roommate).

- [ ] **Step 1: Crear el componente**

Crea `frontend/src/features/matching/components/CompatibilityRadar.tsx`:

```typescript
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend,
} from 'recharts'

interface Props {
  dimensions: Record<string, number>
  compareDimensions?: Record<string, number>
  labelA?: string
  labelB?: string
}

const AXIS_LABEL: Record<string, string> = {
  universidad: 'Universidad', presupuesto: 'Presupuesto', ruido: 'Ruido',
  estudio: 'Estudio', mascotas: 'Mascotas', fumar: 'Fumar',
  sueño: 'Sueño', limpieza: 'Limpieza', invitados: 'Invitados',
}

export function CompatibilityRadar({ dimensions, compareDimensions, labelA = 'Compatibilidad', labelB = 'Candidato' }: Props) {
  const data = Object.keys(dimensions).map((key) => ({
    axis: AXIS_LABEL[key] ?? key,
    a: dimensions[key],
    b: compareDimensions ? (compareDimensions[key] ?? 0) : undefined,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} outerRadius="70%">
        <PolarGrid />
        <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar name={labelA} dataKey="a" stroke="#2563eb" fill="#2563eb" fillOpacity={0.35} />
        {compareDimensions && (
          <Radar name={labelB} dataKey="b" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} />
        )}
        {compareDimensions && <Legend />}
      </RadarChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 2: Verificar tipos**

Run: `cd frontend && npx tsc --noEmit`
Expected: sin errores nuevos.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/matching/components/CompatibilityRadar.tsx
git commit -m "feat(frontend): componente CompatibilityRadar (1 o 2 series)"
```

---

## Task 13: Servicio + página de matching que consume el API

**Estado:** ⬜ Pendiente | **Responsable:** ____ | **Fecha:** ____

**Files:**
- Create: `frontend/src/features/matching/matching.service.ts`
- Create: `frontend/src/features/matching/MatchingPage.tsx`
- Modify: router del frontend (registrar la ruta `/matching`); menú de navegación.

**Interfaces:**
- Consumes: el cliente HTTP del proyecto (mismo patrón que otros `*.service.ts`), `PropertyMatch`, `RoommateMatch`, `CompatibilityRadar`.
- Produces: página `/matching` con dos secciones (habitaciones y roommates), cada tarjeta con `score`, `explanation`, chips de `reasons` y el radar.

- [ ] **Step 1: Localizar el patrón de servicio HTTP existente**

Run: `cd frontend && ls src/features/*/**.service.ts src/services 2>/dev/null; grep -rln "VITE_API_BASE_URL\|api.get\|fetch(" src/services src/features | head`
Copia el patrón (base URL + header Authorization) de un servicio existente.

- [ ] **Step 2: Crear el servicio de matching**

Crea `frontend/src/features/matching/matching.service.ts` siguiendo el patrón encontrado. Debe exponer:

```typescript
import type { PropertyMatch, RoommateMatch } from './types'
// import del cliente HTTP existente del proyecto

export async function getPropertyMatches(): Promise<PropertyMatch[]> {
  // GET /matching/properties con Authorization
}

export async function getRoommateMatches(): Promise<RoommateMatch[]> {
  // GET /matching/roommates con Authorization
}
```

Implementa el cuerpo reutilizando el cliente HTTP del proyecto (el mismo que usan los otros servicios ya conectados al backend).

- [ ] **Step 3: Crear la página**

Crea `frontend/src/features/matching/MatchingPage.tsx` que:
1. Al montar, llama `getPropertyMatches()` y `getRoommateMatches()`.
2. Si recibe 409, muestra un CTA "Completa tu perfil" que enlaza al form de preferencias.
3. Renderiza dos secciones. Cada tarjeta de roommate muestra:
   - nombre, `score` (badge `{score}% compatible`), `explanation`, chips de `reasons`.
   - `<CompatibilityRadar dimensions={miPerfilDimensiones} compareDimensions={match.dimensions} labelA="Tú" labelB={match.user.firstName} />`
     (el perfil propio se obtiene comparando tus preferencias contra ti mismo, o del match roommate a ti — usa `match.dimensions` como la serie del candidato y una serie base "ideal" de 100 para "Tú", o carga tu propio desglose; para el MVP basta 1 serie `dimensions` del match).
   - Cada tarjeta de habitación muestra el radar de 1 serie `dimensions`.

> MVP simple y suficiente: mostrar `<CompatibilityRadar dimensions={match.dimensions} />` (1 serie) en ambas secciones. La 2ª serie de roommate se puede añadir después si se expone el desglose del propio usuario.

- [ ] **Step 4: Registrar ruta y enlace de menú**

Añade la ruta `/matching` al router del frontend apuntando a `MatchingPage`, y un enlace en la navegación (p. ej. "Para ti" o "Matches").

- [ ] **Step 5: Verificar el flujo manualmente**

Run: backend + frontend levantados. Loguéate como `ana.garcia@pucp.pe` / `password123`, entra a `/matching`:
- Deben aparecer habitaciones y roommates rankeados con badge de score, explicación y radar.
- Loguéate como host sin preferencias → debe verse el CTA "Completa tu perfil" (409 manejado).

- [ ] **Step 6: Deprecar `compatibility.ts`**

Ahora que el backend es la fuente de verdad, elimina los usos de `calcCompatibility` en `PropertyCard.tsx` y `RecommendationsPage.tsx` (reemplázalos por el `score`/`reasons` que ya viene del API donde aplique), y borra `frontend/src/features/properties/utils/compatibility.ts`.

Run: `cd frontend && grep -rn "calcCompatibility\|compatibility" src` → no debe quedar ninguna referencia. Luego `npx tsc --noEmit` sin errores.

- [ ] **Step 7: Commit**

```bash
git add frontend/src
git commit -m "feat(frontend): pagina de matching con radar; deprecar compatibility.ts local"
```

---

# FASE 6 — Contacto roommate (Fase 1: directo)

## Task 14: `Conversation.property_id` opcional + crear conversación (repos)

**Estado:** ⬜ Pendiente | **Responsable:** ____ | **Fecha:** ____

**Files:**
- Modify: `backend/app/models/conversation.py`
- Modify: `backend/app/repositories/base.py`
- Modify: `backend/app/repositories/memory/conversation.py`
- Test: `backend/tests/test_messages.py` (o nuevo `test_matching_contact.py`)

**Interfaces:**
- Produces:
  - `Conversation.property_id: int | None`.
  - `ConversationRepository.create(conversation: Conversation) -> Conversation` y `next_id() -> int`.
  - `MemoryConversationRepository` implementa ambos.

- [ ] **Step 1: Escribir el test que falla**

Crea `backend/tests/test_matching_contact.py`:

```python
from __future__ import annotations
from app.models.conversation import Conversation
from app.repositories.memory import MemoryConversationRepository
from app.mock_data import CONVERSATIONS


def test_create_conversation_without_property():
    repo = MemoryConversationRepository(list(CONVERSATIONS))
    new_id = repo.next_id()
    convo = Conversation(
        id=new_id, participants=[1, 3], property_id=None,
        messages=[], last_message_at="2026-07-02T10:00:00",
    )
    created = repo.create(convo)
    assert created.id == new_id
    assert created.property_id is None
    assert repo.get_by_id(new_id) is not None
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd backend && python -m pytest tests/test_matching_contact.py -v`
Expected: FAIL (`property_id` no acepta None, o `create`/`next_id` no existen).

- [ ] **Step 3: Hacer `property_id` opcional**

En `backend/app/models/conversation.py`, cambia:

```python
    property_id: int | None  # None cuando es conversación entre roommates
```

- [ ] **Step 4: Añadir `create`/`next_id` al Protocol**

En `backend/app/repositories/base.py`, dentro de `ConversationRepository`, añade:

```python
    def create(self, conversation: Conversation) -> Conversation: ...
    def next_id(self) -> int: ...
```

- [ ] **Step 5: Implementar en memoria**

En `backend/app/repositories/memory/conversation.py`, añade a `MemoryConversationRepository`:

```python
    def next_id(self) -> int:
        return max((c.id for c in self._store.values()), default=0) + 1

    def create(self, conversation: Conversation) -> Conversation:
        self._store[conversation.id] = conversation
        return conversation
```

(Ajusta `self._store` al nombre real del dict interno del repo; revisa el `__init__`.)

- [ ] **Step 6: Correr los tests y verificar que pasan**

Run: `cd backend && python -m pytest tests/test_matching_contact.py tests/test_messages.py -v`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/app/models/conversation.py backend/app/repositories/base.py backend/app/repositories/memory/conversation.py backend/tests/test_matching_contact.py
git commit -m "feat(chat): property_id opcional y creacion de conversaciones para roommates"
```

---

## Task 15: Endpoint `POST /matching/roommates/{id}/connect` (contacto directo)

**Estado:** ⬜ Pendiente | **Responsable:** ____ | **Fecha:** ____

**Files:**
- Modify: `backend/app/api/v1/matching.py`
- Modify: `backend/app/services/matching.py`
- Test: `backend/tests/test_matching_contact.py`

**Interfaces:**
- Consumes: `ConversationRepository`, `NotificationRepository` (si aplica notificar), `get_conversation_repo`, `get_current_user_id`.
- Produces:
  - `MatchingService.connect_roommate(user_id: int, target_id: int) -> ConversationResponse`
    crea (o reutiliza) la conversación entre ambos y devuelve su representación.
  - `POST /api/v1/matching/roommates/{id}/connect` → `201` con la conversación.

- [ ] **Step 1: Escribir el test que falla**

Añade a `backend/tests/test_matching_contact.py`:

```python
from fastapi.testclient import TestClient


class TestConnectEndpoint:
    def test_connect_creates_conversation(self, client: TestClient, tenant_headers):
        r = client.post("/api/v1/matching/roommates/3/connect", headers=tenant_headers)
        assert r.status_code == 201, r.text
        body = r.json()
        assert 1 in body["participants"] and 3 in body["participants"]

    def test_connect_requires_auth(self, client: TestClient):
        r = client.post("/api/v1/matching/roommates/3/connect")
        assert r.status_code in (401, 403)
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd backend && python -m pytest tests/test_matching_contact.py::TestConnectEndpoint -v`
Expected: FAIL con 404 (ruta no existe).

- [ ] **Step 3: Añadir `connect_roommate` al servicio**

En `backend/app/services/matching.py`, añade al `MatchingService` un método que reciba el repo de conversaciones. Para no romper la firma actual del constructor, añade un parámetro opcional:

```python
    def __init__(self, user_repo, prop_repo, review_repo, convo_repo=None):
        self._users = user_repo
        self._props = prop_repo
        self._reviews = review_repo
        self._convos = convo_repo
```

y el método (usa el schema `ConversationResponse` ya existente en `app.schemas` — verifica su nombre exacto con `grep -rn "ConversationResponse" app/schemas`):

```python
    def connect_roommate(self, user_id: int, target_id: int):
        from datetime import datetime
        from app.models.conversation import Conversation
        # reutiliza conversación existente entre ambos, si la hay
        for c in self._convos.get_by_user_id(user_id):
            if target_id in c.participants:
                return c
        convo = Conversation(
            id=self._convos.next_id(),
            participants=[user_id, target_id],
            property_id=None,
            messages=[],
            last_message_at=datetime.now().isoformat(timespec="seconds"),
        )
        return self._convos.create(convo)
```

> Devuelve el modelo `Conversation`; el endpoint lo serializa con el `response_model` del schema de conversación existente (el mismo que usa `GET /users/{id}/conversations`).

- [ ] **Step 4: Añadir el endpoint**

En `backend/app/api/v1/matching.py`:
1. Importa `get_conversation_repo`, `ConversationRepository`, y el schema de conversación existente (revisa `app/schemas` para el nombre; ej. `ConversationResponse`).
2. Extiende `_get_service` para inyectar también el repo de conversaciones.
3. Añade:

```python
@router.post("/roommates/{target_id}/connect", response_model=ConversationResponse, status_code=201)
def connect_roommate(
    target_id: int,
    user_id: int = Depends(get_current_user_id),
    svc: MatchingService = Depends(_get_service),
) -> ConversationResponse:
    return svc.connect_roommate(user_id, target_id)
```

- [ ] **Step 5: Correr toda la suite y verificar que pasa**

Run: `cd backend && python -m pytest tests/ -v`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/app/api/v1/matching.py backend/app/services/matching.py backend/tests/test_matching_contact.py
git commit -m "feat(matching): endpoint connect crea conversacion directa entre roommates"
```

---

## Task 16: Botón "Contactar" en la tarjeta de roommate (frontend)

**Estado:** ⬜ Pendiente | **Responsable:** ____ | **Fecha:** ____

**Files:**
- Modify: `frontend/src/features/matching/matching.service.ts`
- Modify: `frontend/src/features/matching/MatchingPage.tsx`

**Interfaces:**
- Produces: `connectRoommate(id: number): Promise<Conversation>` en el servicio; botón "Contactar" en cada tarjeta que, al éxito, navega al chat existente.

- [ ] **Step 1: Añadir la llamada al servicio**

En `frontend/src/features/matching/matching.service.ts`:

```typescript
export async function connectRoommate(targetId: number) {
  // POST /matching/roommates/{targetId}/connect con Authorization → devuelve la conversación
}
```

- [ ] **Step 2: Botón en la tarjeta**

En `MatchingPage.tsx`, cada tarjeta de roommate añade un botón "Contactar" que llama `connectRoommate(match.user.id)` y, al éxito, navega a la vista de mensajería/chat existente con esa conversación.

- [ ] **Step 3: Verificar manualmente**

Run: frontend + backend levantados. Como Ana, pulsa "Contactar" en un roommate → se crea la conversación y se navega al chat. Repetir "Contactar" con el mismo → reutiliza la conversación (no duplica).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/matching
git commit -m "feat(frontend): boton Contactar en tarjeta de roommate (contacto directo)"
```

---

# FASE 7 — Contacto roommate (Fase 2: doble opt-in)

> **Nota:** esta fase es opcional para el MVP. Añade una capa de solicitud→aceptación sobre el contacto directo de la Fase 6, para respetar el consentimiento mutuo. Implementarla solo si el equipo decide priorizar privacidad sobre simplicidad.

## Task 17: Modelo y repositorio de solicitudes de conexión

**Estado:** ⬜ Pendiente | **Responsable:** ____ | **Fecha:** ____

**Files:**
- Create: `backend/app/models/connection_request.py`
- Modify: `backend/app/repositories/base.py`, `backend/app/repositories/memory/__init__.py`
- Create: `backend/app/repositories/memory/connection_request.py`
- Modify: `backend/app/main.py` (registrar el repo en `app.state`), `backend/app/api/deps.py`
- Test: `backend/tests/test_matching_contact.py`

**Interfaces:**
- Produces:
  - `ConnectionRequest` (modelo): `id, from_id, to_id, status ('pending'|'accepted'|'rejected'), created_at`.
  - `ConnectionRequestRepository` (Protocol) + implementación en memoria: `create`, `get_incoming(user_id)`, `get_by_id`, `set_status`, `next_id`.

- [ ] **Step 1: Escribir el test que falla**

Añade a `backend/tests/test_matching_contact.py`:

```python
class TestConnectionRequests:
    def test_create_and_accept_request(self):
        from app.models.connection_request import ConnectionRequest
        from app.repositories.memory.connection_request import MemoryConnectionRequestRepository
        repo = MemoryConnectionRequestRepository([])
        req = repo.create(ConnectionRequest(
            id=repo.next_id(), from_id=1, to_id=3, status="pending", created_at="2026-07-02",
        ))
        assert req.status == "pending"
        assert any(r.id == req.id for r in repo.get_incoming(3))
        updated = repo.set_status(req.id, "accepted")
        assert updated.status == "accepted"
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd backend && python -m pytest tests/test_matching_contact.py::TestConnectionRequests -v`
Expected: FAIL (módulos no existen).

- [ ] **Step 3: Crear el modelo**

Crea `backend/app/models/connection_request.py`:

```python
from __future__ import annotations
from pydantic import BaseModel, ConfigDict


class ConnectionRequest(BaseModel):
    model_config = ConfigDict(frozen=False)

    id: int
    from_id: int
    to_id: int
    status: str  # 'pending' | 'accepted' | 'rejected'
    created_at: str
```

- [ ] **Step 4: Crear el repositorio en memoria**

Crea `backend/app/repositories/memory/connection_request.py`:

```python
from __future__ import annotations
from app.models.connection_request import ConnectionRequest


class MemoryConnectionRequestRepository:
    def __init__(self, seed: list[ConnectionRequest]) -> None:
        self._store: dict[int, ConnectionRequest] = {r.id: r for r in seed}

    def next_id(self) -> int:
        return max(self._store.keys(), default=0) + 1

    def create(self, req: ConnectionRequest) -> ConnectionRequest:
        self._store[req.id] = req
        return req

    def get_by_id(self, req_id: int) -> ConnectionRequest | None:
        return self._store.get(req_id)

    def get_incoming(self, user_id: int) -> list[ConnectionRequest]:
        return [r for r in self._store.values() if r.to_id == user_id]

    def set_status(self, req_id: int, status: str) -> ConnectionRequest | None:
        req = self._store.get(req_id)
        if req is None:
            return None
        req.status = status
        return req
```

- [ ] **Step 5: Registrar en `__init__`, Protocol, `main.py` y `deps.py`**

- En `backend/app/repositories/memory/__init__.py`: exporta `MemoryConnectionRequestRepository`.
- En `backend/app/repositories/base.py`: añade el Protocol `ConnectionRequestRepository` con las firmas de arriba.
- En `backend/app/main.py`: en `lifespan`, añade `app.state.connection_request_repo = MemoryConnectionRequestRepository([])`.
- En `backend/app/api/deps.py`: añade `get_connection_request_repo(request) -> ConnectionRequestRepository`.

- [ ] **Step 6: Correr los tests y verificar que pasan**

Run: `cd backend && python -m pytest tests/test_matching_contact.py -v`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/app/models/connection_request.py backend/app/repositories backend/app/main.py backend/app/api/deps.py backend/tests/test_matching_contact.py
git commit -m "feat(matching): modelo y repo de solicitudes de conexion (doble opt-in)"
```

---

## Task 18: Endpoints de solicitud/aceptación y cambio del flujo `connect`

**Estado:** ⬜ Pendiente | **Responsable:** ____ | **Fecha:** ____

**Files:**
- Modify: `backend/app/api/v1/matching.py`, `backend/app/services/matching.py`
- Create/Modify: schema de solicitud en `backend/app/schemas/matching.py`
- Test: `backend/tests/test_matching_contact.py`

**Interfaces:**
- Produces:
  - `POST /matching/roommates/{id}/request` → crea `ConnectionRequest(pending)` + notificación al destinatario (201).
  - `GET /matching/requests` → solicitudes entrantes del usuario autenticado.
  - `POST /matching/requests/{id}/accept` → marca `accepted` y **crea la conversación** (la del Task 15).
  - `POST /matching/requests/{id}/reject` → marca `rejected`.

- [ ] **Step 1: Escribir el test que falla**

Añade a `backend/tests/test_matching_contact.py`:

```python
class TestDoubleOptIn:
    def test_request_then_accept_creates_conversation(self, client: TestClient, tenant_headers):
        # Ana (1) solicita a Lucía (3)
        r = client.post("/api/v1/matching/roommates/3/request", headers=tenant_headers)
        assert r.status_code == 201, r.text
        req_id = r.json()["id"]
        # Lucía acepta (necesita su token; usar login directo)
        login = client.post("/api/v1/auth/login",
                            json={"email": "lucia.torres@uni.pe", "password": "password123"})
        lucia_headers = {"Authorization": f"Bearer {login.json()['accessToken']}"}
        acc = client.post(f"/api/v1/matching/requests/{req_id}/accept", headers=lucia_headers)
        assert acc.status_code == 200, acc.text
        assert 1 in acc.json()["participants"] and 3 in acc.json()["participants"]
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd backend && python -m pytest tests/test_matching_contact.py::TestDoubleOptIn -v`
Expected: FAIL con 404.

- [ ] **Step 3: Implementar servicio + endpoints**

En `backend/app/services/matching.py`, añade métodos al servicio (inyectando el repo de solicitudes): `request_roommate(from_id, to_id)`, `list_incoming(user_id)`, `accept_request(user_id, req_id)` (valida que `user_id == req.to_id`, marca `accepted`, y llama `connect_roommate(req.from_id, req.to_id)`), `reject_request(user_id, req_id)`.

En `backend/app/api/v1/matching.py`, añade los cuatro endpoints con sus `response_model`. Define en `schemas/matching.py` un `ConnectionRequestResponse(BaseSchema)` con `id, fromId, toId, status, createdAt`.

- [ ] **Step 4: Correr toda la suite y verificar que pasa**

Run: `cd backend && python -m pytest tests/ -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/app/api/v1/matching.py backend/app/services/matching.py backend/app/schemas/matching.py backend/tests/test_matching_contact.py
git commit -m "feat(matching): flujo doble opt-in (solicitar, aceptar, rechazar) crea conversacion al aceptar"
```

---

## Task 19: UI de solicitudes (frontend)

**Estado:** ⬜ Pendiente | **Responsable:** ____ | **Fecha:** ____

**Files:**
- Modify: `frontend/src/features/matching/matching.service.ts`, `MatchingPage.tsx`
- Create: componente/bandeja de solicitudes entrantes.

**Interfaces:**
- Produces: en `matching.service.ts` — `requestRoommate(id)`, `getIncomingRequests()`, `acceptRequest(id)`, `rejectRequest(id)`. En la UI, el botón "Contactar" ahora envía **solicitud**; una bandeja muestra solicitudes entrantes con Aceptar/Rechazar.

- [ ] **Step 1: Añadir las 4 llamadas al servicio**

En `matching.service.ts`, añade `requestRoommate`, `getIncomingRequests`, `acceptRequest`, `rejectRequest` (POST/GET a las rutas de la Task 18).

- [ ] **Step 2: Cambiar "Contactar" por "Enviar solicitud"**

En `MatchingPage.tsx`, el botón de la tarjeta de roommate ahora llama `requestRoommate(match.user.id)` y muestra estado "Solicitud enviada".

- [ ] **Step 3: Bandeja de solicitudes entrantes**

Añade una sección/vista que liste `getIncomingRequests()` con botones Aceptar (llama `acceptRequest` → navega al chat creado) y Rechazar (`rejectRequest`).

- [ ] **Step 4: Verificar manualmente el flujo doble opt-in**

Run: dos sesiones (Ana y Lucía). Ana envía solicitud a Lucía → Lucía la ve en su bandeja → acepta → se crea la conversación y ambas pueden chatear.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/matching
git commit -m "feat(frontend): UI de solicitudes de roommate (doble opt-in)"
```

---

## Cierre

- [ ] **Correr toda la suite backend:** `cd backend && python -m pytest tests/ -v` → todo verde.
- [ ] **Type-check frontend:** `cd frontend && npx tsc --noEmit` → sin errores nuevos.
- [ ] **Actualizar el tablero de fases** al inicio de este documento con el estado final.
- [ ] **Actualizar el README** raíz: marcar la funcionalidad de IA de matching como implementada y enlazar el spec.
