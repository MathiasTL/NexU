from __future__ import annotations
from app.models.review import Review


class MemoryReviewRepository:
    def __init__(self, seed: list[Review]) -> None:
        self._store: dict[int, Review] = {r.id: r for r in seed}

    def get_by_property_id(self, property_id: int) -> list[Review]:
        return [r for r in self._store.values() if r.property_id == property_id]

    def get_by_property_ids(self, property_ids: list[int]) -> list[Review]:
        id_set = set(property_ids)
        return [r for r in self._store.values() if r.property_id in id_set]

    def create(self, review: Review) -> Review:
        self._store[review.id] = review
        return review

    def next_id(self) -> int:
        return max(self._store.keys(), default=0) + 1
