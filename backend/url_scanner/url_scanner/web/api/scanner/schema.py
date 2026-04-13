from datetime import datetime

from pydantic import BaseModel, ConfigDict, HttpUrl


class ImageDetail(BaseModel):
    """BaseModel for storing image detail in ScanResponse."""

    url: str
    alt_text: str | None
    has_alt: bool

class ScanResponse(BaseModel):
    """Response model for scan api."""

    message: str
    scan_id: int
    total_images: int
    missing_alt_count: int
    images: list[ImageDetail]

class ScanRequest(BaseModel):
    """Class for Url type checking."""

    url: HttpUrl

# --- Schema for /history ---
class HistoryResponse(BaseModel):
    """Response model for history api."""

    id: int
    url: str
    total_img: int | None
    with_alt: int | None
    without_alt: int | None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
