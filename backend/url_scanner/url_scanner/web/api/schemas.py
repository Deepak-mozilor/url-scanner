from datetime import datetime

from pydantic import BaseModel, ConfigDict, HttpUrl


class ImageDetail(BaseModel):
    url: str
    alt_text: str | None
    has_alt: bool

class ScanResponse(BaseModel):
    message: str
    scan_id: int
    total_images: int
    missing_alt_count: int
    images: list[ImageDetail]

class ScanRequest(BaseModel):
    url: HttpUrl

# --- Schema for /history ---
class HistoryResponse(BaseModel):
    id: int
    url: str
    total_img: int | None
    with_alt: int | None
    without_alt: int | None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
