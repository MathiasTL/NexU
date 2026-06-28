from __future__ import annotations
from contextlib import asynccontextmanager
from typing import AsyncIterator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1.router import router
from app.repositories.memory import (
    MemoryUserRepository,
    MemoryPropertyRepository,
    MemoryBookingRepository,
    MemoryReviewRepository,
    MemoryNotificationRepository,
    MemoryConversationRepository,
    MemoryAmenityRepository,
)
from app.services.storage import MemoryStorageRepository
from mock_data import (
    USERS, PROPERTIES, BOOKINGS, REVIEWS,
    NOTIFICATIONS, CONVERSATIONS, AMENITY_CATEGORIES,
)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.user_repo = MemoryUserRepository(USERS)
    app.state.property_repo = MemoryPropertyRepository(PROPERTIES)
    app.state.booking_repo = MemoryBookingRepository(BOOKINGS)
    app.state.review_repo = MemoryReviewRepository(REVIEWS)
    app.state.notification_repo = MemoryNotificationRepository(NOTIFICATIONS)
    app.state.conversation_repo = MemoryConversationRepository(CONVERSATIONS)
    app.state.amenity_repo = MemoryAmenityRepository(AMENITY_CATEGORIES)
    app.state.storage_repo = MemoryStorageRepository()
    yield


app = FastAPI(
    title="NexU API",
    description="Backend para la plataforma de alquiler universitario NexU — Lima, Perú",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
)

app.include_router(router)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok", "version": "1.0.0"}
