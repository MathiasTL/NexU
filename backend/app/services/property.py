from __future__ import annotations
from datetime import date
from app.repositories.base import PropertyRepository, ReviewRepository
from app.models.property import Property
from app.schemas.property import PropertyResponse, CreatePropertyRequest


def _enrich(prop: Property, review_repo: ReviewRepository) -> PropertyResponse:
    reviews = review_repo.get_by_property_id(prop.id)
    rating = round(sum(r.rating for r in reviews) / len(reviews), 1) if reviews else 0.0
    return PropertyResponse(
        id=prop.id,
        host_id=prop.host_id,
        title=prop.title,
        description=prop.description,
        short_description=prop.short_description,
        room_type=prop.room_type,
        price_per_month=prop.price_per_month,
        price_per_night=prop.price_per_night,
        currency=prop.currency,
        location=prop.location,
        district=prop.district,
        city=prop.city,
        country=prop.country,
        lat=prop.lat,
        lng=prop.lng,
        images=prop.images,
        amenities=prop.amenities,
        capacity=prop.capacity,
        bedrooms=prop.bedrooms,
        beds=prop.beds,
        bathrooms=prop.bathrooms,
        rating=rating,
        reviews_count=len(reviews),
        checkin_time=prop.checkin_time,
        checkout_time=prop.checkout_time,
        house_rules=prop.house_rules,
        status=prop.status,
        availability_status=prop.availability_status,
        verified_host=prop.verified_host,
        nearest_university=prop.nearest_university,
        distance_to_university_minutes=prop.distance_to_university_minutes,
        created_at=prop.created_at,
    )


class PropertyService:
    def __init__(self, prop_repo: PropertyRepository, review_repo: ReviewRepository) -> None:
        self._props = prop_repo
        self._reviews = review_repo

    def get_all(self) -> list[PropertyResponse]:
        return [_enrich(p, self._reviews) for p in self._props.get_all_active()]

    def get_by_id(self, property_id: int) -> PropertyResponse | None:
        prop = self._props.get_by_id(property_id)
        if prop is None:
            return None
        return _enrich(prop, self._reviews)

    def get_by_host_id(self, host_id: int) -> list[PropertyResponse]:
        return [_enrich(p, self._reviews) for p in self._props.get_by_host_id(host_id)]

    def search(
        self,
        district: str | None = None,
        room_type: str | None = None,
        nearest_university: str | None = None,
        min_price_per_month: float | None = None,
        max_price_per_month: float | None = None,
        capacity: int | None = None,
        amenities: list[str] | None = None,
        query: str | None = None,
        pets_allowed: bool | None = None,
        quiet_hours: bool | None = None,
        has_workspace: bool | None = None,
    ) -> list[PropertyResponse]:
        props = self._props.search(
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
        return [_enrich(p, self._reviews) for p in props]

    def create(self, host_id: int, req: CreatePropertyRequest) -> PropertyResponse:
        new_id = self._props.next_id()
        prop = Property(
            id=new_id,
            host_id=host_id,
            title=req.title,
            description=req.description,
            short_description=req.short_description,
            room_type=req.room_type,
            price_per_month=req.price_per_month,
            price_per_night=req.price_per_night,
            currency="PEN",
            location=req.location,
            district=req.district,
            city=req.city,
            country=req.country,
            lat=req.lat,
            lng=req.lng,
            images=req.images,
            amenities=req.amenities,
            capacity=req.capacity,
            bedrooms=req.bedrooms,
            beds=req.beds,
            bathrooms=req.bathrooms,
            checkin_time=req.checkin_time,
            checkout_time=req.checkout_time,
            house_rules=req.house_rules,
            status="active",
            availability_status=req.availability_status,
            verified_host=False,
            nearest_university=req.nearest_university,
            distance_to_university_minutes=req.distance_to_university_minutes,
            created_at=date.today().isoformat(),
        )
        self._props.create(prop)
        return _enrich(prop, self._reviews)
