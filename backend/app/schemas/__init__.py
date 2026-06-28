from app.schemas.common import BaseSchema, PaginatedResponse, ErrorResponse
from app.schemas.auth import LoginRequest, RegisterRequest, AuthResponse, RefreshRequest, RefreshResponse
from app.schemas.user import AuthUserResponse, LifestylePreferencesSchema, ProfileUpdateRequest, PersonalInfoUpdateRequest, PreferencesUpdateRequest
from app.schemas.property import PropertyResponse, CreatePropertyRequest, UploadImagesResponse
from app.schemas.booking import BookingResponse, CreateBookingRequest, UpdateBookingStatusRequest
from app.schemas.review import ReviewResponse, DashboardStatsResponse, NotificationResponse, MessageResponse, ConversationResponse, SendMessageRequest

__all__ = [
    "BaseSchema", "PaginatedResponse", "ErrorResponse",
    "LoginRequest", "RegisterRequest", "AuthResponse", "RefreshRequest", "RefreshResponse",
    "AuthUserResponse", "LifestylePreferencesSchema", "ProfileUpdateRequest", "PersonalInfoUpdateRequest", "PreferencesUpdateRequest",
    "PropertyResponse", "CreatePropertyRequest", "UploadImagesResponse",
    "BookingResponse", "CreateBookingRequest", "UpdateBookingStatusRequest",
    "ReviewResponse", "DashboardStatsResponse", "NotificationResponse", "MessageResponse", "ConversationResponse", "SendMessageRequest",
]
