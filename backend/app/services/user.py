from __future__ import annotations
from app.repositories.base import UserRepository, NotificationRepository, ConversationRepository, PropertyRepository
from app.models.user import LifestylePreferences
from app.schemas.user import AuthUserResponse, LifestylePreferencesSchema, ProfileUpdateRequest, PersonalInfoUpdateRequest, PreferencesUpdateRequest
from app.schemas.review import NotificationResponse, ConversationResponse, MessageResponse, SendMessageRequest, ParticipantInfo
from app.models.conversation import Message
from app.core.exceptions import not_found, conflict
from app.services.auth import _to_auth_user
from datetime import datetime, timezone


class UserService:
    def __init__(
        self,
        user_repo: UserRepository,
        notif_repo: NotificationRepository,
        convo_repo: ConversationRepository,
        property_repo: PropertyRepository | None = None,
    ) -> None:
        self._users = user_repo
        self._notifs = notif_repo
        self._convos = convo_repo
        self._properties = property_repo

    def get_public_profile(self, user_id: int) -> AuthUserResponse:
        user = self._users.get_by_id(user_id)
        if user is None:
            raise not_found("User", user_id)
        return _to_auth_user(user)

    def update_profile(self, user_id: int, req: ProfileUpdateRequest) -> AuthUserResponse:
        user = self._users.update_profile(user_id, req.first_name, req.last_name, req.phone, req.bio)
        if user is None:
            raise not_found("User", user_id)
        return _to_auth_user(user)

    def update_personal_info(self, user_id: int, req: PersonalInfoUpdateRequest) -> AuthUserResponse:
        existing = self._users.get_by_email(str(req.email))
        if existing and existing.id != user_id:
            raise conflict("Email already in use by another account")
        user = self._users.update_personal_info(user_id, str(req.email), req.phone)
        if user is None:
            raise not_found("User", user_id)
        return _to_auth_user(user)

    def update_preferences(self, user_id: int, req: PreferencesUpdateRequest) -> AuthUserResponse:
        prefs = LifestylePreferences(
            sleep_schedule=req.lifestyle_preferences.sleep_schedule,
            study_habits=req.lifestyle_preferences.study_habits,
            noise_level=req.lifestyle_preferences.noise_level,
            cleanliness=req.lifestyle_preferences.cleanliness,
            guests_policy=req.lifestyle_preferences.guests_policy,
            smoking_policy=req.lifestyle_preferences.smoking_policy,
            pets_policy=req.lifestyle_preferences.pets_policy,
            target_university=req.lifestyle_preferences.target_university,
            max_monthly_budget=req.lifestyle_preferences.max_monthly_budget,
        )
        user = self._users.update_preferences(user_id, prefs)
        if user is None:
            raise not_found("User", user_id)
        return _to_auth_user(user)

    def get_notifications(self, user_id: int) -> list[NotificationResponse]:
        return [
            NotificationResponse(
                id=n.id,
                user_id=n.user_id,
                type=n.type,
                title=n.title,
                message=n.message,
                read=n.read,
                created_at=n.created_at,
            )
            for n in self._notifs.get_by_user_id(user_id)
        ]

    def mark_notification_read(self, notification_id: int) -> None:
        result = self._notifs.mark_read(notification_id)
        if result is None:
            raise not_found("Notification", notification_id)

    def get_conversations(self, user_id: int) -> list[ConversationResponse]:
        convos = self._convos.get_by_user_id(user_id)
        result = []
        for c in convos:
            prop_title: str | None = None
            if self._properties is not None and c.property_id is not None:
                prop = self._properties.get_by_id(c.property_id)
                if prop is not None:
                    prop_title = prop.title

            participants_info: list[ParticipantInfo] = []
            for pid in c.participants:
                u = self._users.get_by_id(pid)
                if u is not None:
                    participants_info.append(ParticipantInfo(
                        id=u.id,
                        first_name=u.first_name,
                        last_name=u.last_name,
                        avatar_url=u.avatar_url,
                    ))

            result.append(ConversationResponse(
                id=c.id,
                participants=c.participants,
                participants_info=participants_info,
                property_id=c.property_id,
                property_title=prop_title,
                messages=[MessageResponse(id=m.id, sender_id=m.sender_id, text=m.text, created_at=m.created_at) for m in c.messages],
                last_message_at=c.last_message_at,
            ))
        return result

    def send_message(self, conversation_id: int, req: SendMessageRequest) -> MessageResponse:
        convo = self._convos.get_by_id(conversation_id)
        if convo is None:
            raise not_found("Conversation", conversation_id)
        now = datetime.now(timezone.utc).isoformat()
        msg = Message(
            id=self._convos.next_message_id(),
            sender_id=req.sender_id,
            text=req.text,
            created_at=now,
        )
        self._convos.add_message(conversation_id, msg)
        return MessageResponse(id=msg.id, sender_id=msg.sender_id, text=msg.text, created_at=msg.created_at)
