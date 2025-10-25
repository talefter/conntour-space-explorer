from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class ImageItem(BaseModel):
    id: str
    nasa_id: str
    title: str
    description: str = ""
    date_created: str = ""
    keywords: List[str] = Field(default_factory=list)
    preview_url: str


class SearchResult(BaseModel):
    query: str
    results: List[ImageItem]
    scores: Dict[str, float]


class HistoryEntry(BaseModel):
    id: str
    timestamp: int
    query: str
    total: int
    result_ids: List[str]
    result_scores: Dict[str, float]


class PaginationMixin(BaseModel):
    total: int = Field(ge=0)
    page: int = Field(ge=1)
    page_size: int = Field(ge=1, le=100)


class PaginatedHistory(PaginationMixin):
    items: List[HistoryEntry]


class PaginatedImages(PaginationMixin):
    items: List[ImageItem]


class PaginatedSearchResult(PaginationMixin):
    query: str
    items: List[ImageItem]
    scores: Dict[str, float]


class HealthResponse(BaseModel):
    status: str = "ok"


class DeleteResponse(BaseModel):
    deleted: str