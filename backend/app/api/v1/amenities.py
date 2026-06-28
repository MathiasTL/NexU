from __future__ import annotations
from fastapi import APIRouter, Depends
from app.models.amenity import AmenityCategory
from app.api.deps import get_amenity_repo
from app.repositories.base import AmenityRepository

router = APIRouter(prefix="/amenities", tags=["amenities"])


@router.get("", response_model=list[AmenityCategory])
def list_amenities(repo: AmenityRepository = Depends(get_amenity_repo)) -> list[AmenityCategory]:
    return repo.get_all_categories()
