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
from app.repositories.base import UserRepository, PropertyRepository, ReviewRepository
from app.services.property import _enrich as _enrich_property
from app.schemas.matching import PropertyMatchResponse, RoommateMatchResponse
from app.schemas.user import AuthUserResponse, LifestylePreferencesSchema
from app.core.exceptions import conflict


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
