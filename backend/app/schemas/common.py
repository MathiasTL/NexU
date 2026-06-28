from __future__ import annotations
from typing import Generic, TypeVar
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

T = TypeVar("T")


class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class PaginatedResponse(BaseSchema, Generic[T]):
    data: list[T]
    total: int
    page: int
    page_size: int


class ErrorResponse(BaseSchema):
    detail: str
