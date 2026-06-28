from __future__ import annotations
from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException
from app.schemas.property import PropertyResponse, CreatePropertyRequest, UploadImagesResponse
from app.services.property import PropertyService
from app.services.storage import StorageRepository
from app.api.deps import (
    get_property_repo, get_review_repo, get_storage_repo, get_current_user_id,
)
from app.repositories.base import PropertyRepository, ReviewRepository
from app.core.exceptions import not_found

router = APIRouter(prefix="/properties", tags=["properties"])
host_props_router = APIRouter(tags=["properties"])


def _get_service(
    prop_repo: PropertyRepository = Depends(get_property_repo),
    review_repo: ReviewRepository = Depends(get_review_repo),
) -> PropertyService:
    return PropertyService(prop_repo, review_repo)


@router.get("", response_model=list[PropertyResponse])
def list_properties(svc: PropertyService = Depends(_get_service)) -> list[PropertyResponse]:
    return svc.get_all()


@router.get("/search", response_model=list[PropertyResponse])
def search_properties(
    district: str | None = Query(None),
    room_type: str | None = Query(None, alias="roomType"),
    nearest_university: str | None = Query(None, alias="nearestUniversity"),
    min_price_per_month: float | None = Query(None, alias="minPricePerMonth"),
    max_price_per_month: float | None = Query(None, alias="maxPricePerMonth"),
    capacity: int | None = Query(None),
    amenities: list[str] | None = Query(None),
    query: str | None = Query(None),
    pets_allowed: bool | None = Query(None, alias="petsAllowed"),
    quiet_hours: bool | None = Query(None, alias="quietHours"),
    has_workspace: bool | None = Query(None, alias="hasWorkspace"),
    svc: PropertyService = Depends(_get_service),
) -> list[PropertyResponse]:
    return svc.search(
        district=district,
        room_type=room_type,
        nearest_university=nearest_university,
        min_price_per_month=min_price_per_month,
        max_price_per_month=max_price_per_month,
        capacity=capacity,
        amenities=amenities,
        query=query,
        pets_allowed=pets_allowed,
        quiet_hours=quiet_hours,
        has_workspace=has_workspace,
    )


@router.post("/upload-images", response_model=UploadImagesResponse)
async def upload_images(
    files: list[UploadFile] = File(...),
    _: int = Depends(get_current_user_id),
    storage: StorageRepository = Depends(get_storage_repo),
) -> UploadImagesResponse:
    urls: list[str] = []
    for f in files:
        content = await f.read()
        url = storage.upload(f.filename or "image", content, f.content_type or "image/jpeg")
        urls.append(url)
    return UploadImagesResponse(urls=urls)


@router.get("/{property_id}", response_model=PropertyResponse)
def get_property(property_id: int, svc: PropertyService = Depends(_get_service)) -> PropertyResponse:
    prop = svc.get_by_id(property_id)
    if prop is None:
        raise not_found("Property", property_id)
    return prop


@router.post("", response_model=PropertyResponse, status_code=201)
def create_property(
    body: CreatePropertyRequest,
    host_id: int = Depends(get_current_user_id),
    svc: PropertyService = Depends(_get_service),
) -> PropertyResponse:
    return svc.create(host_id, body)


@host_props_router.get("/users/{host_id}/properties", response_model=list[PropertyResponse])
def get_host_properties(
    host_id: int,
    svc: PropertyService = Depends(_get_service),
) -> list[PropertyResponse]:
    return svc.get_by_host_id(host_id)
