from __future__ import annotations
from fastapi import APIRouter
from app.api.v1 import auth, properties, bookings, reviews, users, host, amenities, matching

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(properties.router)
router.include_router(properties.host_props_router)
router.include_router(bookings.router)
router.include_router(reviews.router)
router.include_router(users.router)
router.include_router(host.router)
router.include_router(amenities.router)
router.include_router(matching.router)
