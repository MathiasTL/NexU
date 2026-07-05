"""
Motor de compatibilidad determinista (sin IO, sin LLM).

Portado de frontend/src/features/properties/utils/compatibility.ts como
fuente única de verdad del backend. Devuelve score 0-100, razones en lenguaje
humano y un desglose por dimensión para el radar comparativo.
"""
from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime, timezone
from app.models.user import LifestylePreferences
from app.models.property import Property
from app.repositories.base import (
    UserRepository, PropertyRepository, ReviewRepository, ConversationRepository,
    ConnectionRequestRepository,
)
from app.services.property import _enrich as _enrich_property
from app.schemas.matching import (
    PropertyMatchResponse, RoommateMatchResponse, ConnectionRequestResponse,
)
from app.schemas.user import AuthUserResponse, LifestylePreferencesSchema
from app.schemas.review import ConversationResponse, MessageResponse, ParticipantInfo
from app.models.conversation import Conversation
from app.models.connection_request import ConnectionRequest
from app.core.exceptions import conflict, not_found, forbidden
from app.services.ai_explainer import explain, ROOM, ROOMMATE


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


def _conversation_response(convo: Conversation, users: UserRepository) -> ConversationResponse:
    participants_info: list[ParticipantInfo] = []
    for pid in convo.participants:
        u = users.get_by_id(pid)
        if u is not None:
            participants_info.append(ParticipantInfo(
                id=u.id, first_name=u.first_name, last_name=u.last_name, avatar_url=u.avatar_url,
            ))
    return ConversationResponse(
        id=convo.id,
        participants=convo.participants,
        participants_info=participants_info,
        property_id=convo.property_id,
        property_title=None,
        messages=[
            MessageResponse(id=m.id, sender_id=m.sender_id, text=m.text, created_at=m.created_at)
            for m in convo.messages
        ],
        last_message_at=convo.last_message_at,
    )


def _request_response(req: ConnectionRequest) -> ConnectionRequestResponse:
    return ConnectionRequestResponse(
        id=req.id, from_id=req.from_id, to_id=req.to_id,
        status=req.status, created_at=req.created_at,
    )


class MatchingService:
    def __init__(
        self,
        user_repo: UserRepository,
        prop_repo: PropertyRepository,
        review_repo: ReviewRepository,
        convo_repo: ConversationRepository | None = None,
        request_repo: ConnectionRequestRepository | None = None,
    ) -> None:
        self._users = user_repo
        self._props = prop_repo
        self._reviews = review_repo
        self._convos = convo_repo
        self._requests = request_repo

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
                explanation=explain(f"la habitación '{prop.title}'", bd.reasons, domain=ROOM),
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
                explanation=explain(f"el/la compañero(a) {other.first_name}", bd.reasons, domain=ROOMMATE),
            ))
        matches.sort(key=lambda m: m.score, reverse=True)
        return matches

    def connect_roommate(self, user_id: int, target_id: int) -> ConversationResponse:
        """Crea (o reutiliza) la conversación directa entre dos roommates."""
        if self._convos is None:
            raise conflict("Contacto no disponible")
        if target_id == user_id:
            raise conflict("No puedes contactarte contigo mismo")
        if self._users.get_by_id(target_id) is None:
            raise not_found("Usuario", target_id)

        # Reutiliza una conversación existente entre ambos, si la hay.
        for c in self._convos.get_by_user_id(user_id):
            if target_id in c.participants:
                return _conversation_response(c, self._users)

        convo = Conversation(
            id=self._convos.next_id(),
            participants=[user_id, target_id],
            property_id=None,
            messages=[],
            last_message_at=datetime.now(timezone.utc).isoformat(),
        )
        created = self._convos.create(convo)
        return _conversation_response(created, self._users)

    # ── Doble opt-in (solicitud → aceptación) ─────────────────────────────────

    def request_roommate(self, from_id: int, to_id: int) -> ConnectionRequestResponse:
        if self._requests is None:
            raise conflict("Solicitudes no disponibles")
        if to_id == from_id:
            raise conflict("No puedes enviarte una solicitud a ti mismo")
        if self._users.get_by_id(to_id) is None:
            raise not_found("Usuario", to_id)
        req = self._requests.create(ConnectionRequest(
            id=self._requests.next_id(),
            from_id=from_id,
            to_id=to_id,
            status="pending",
            created_at=datetime.now(timezone.utc).isoformat(),
        ))
        return _request_response(req)

    def list_incoming(self, user_id: int) -> list[ConnectionRequestResponse]:
        if self._requests is None:
            raise conflict("Solicitudes no disponibles")
        return [_request_response(r) for r in self._requests.get_incoming(user_id)]

    def accept_request(self, user_id: int, req_id: int) -> ConversationResponse:
        req = self._require_request(user_id, req_id)
        self._requests.set_status(req.id, "accepted")  # type: ignore[union-attr]
        return self.connect_roommate(req.from_id, req.to_id)

    def reject_request(self, user_id: int, req_id: int) -> ConnectionRequestResponse:
        req = self._require_request(user_id, req_id)
        updated = self._requests.set_status(req.id, "rejected")  # type: ignore[union-attr]
        return _request_response(updated or req)

    def _require_request(self, user_id: int, req_id: int) -> ConnectionRequest:
        if self._requests is None:
            raise conflict("Solicitudes no disponibles")
        req = self._requests.get_by_id(req_id)
        if req is None:
            raise not_found("Solicitud", req_id)
        if req.to_id != user_id:
            raise forbidden("Solo el destinatario puede responder esta solicitud")
        return req
