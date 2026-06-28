from __future__ import annotations
from typing import Protocol
import uuid


class StorageRepository(Protocol):
    def upload(self, filename: str, content: bytes, content_type: str) -> str: ...


class MemoryStorageRepository:
    """Stub: returns a placeholder URL. Swap for S3/GCS implementation in production."""

    BASE_URL = "https://nexu-storage-placeholder.local/images"

    def upload(self, filename: str, content: bytes, content_type: str) -> str:
        unique_name = f"{uuid.uuid4().hex}_{filename}"
        return f"{self.BASE_URL}/{unique_name}"
