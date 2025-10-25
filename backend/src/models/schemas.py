from typing import Dict, List, Optional
from pydantic import BaseModel


class ImageItem(BaseModel):
    id: str
    nasa_id: str
    title: str
    description: Optional[str] = None
    date_created: Optional[str] = None
    keywords: List[str] = []
    preview_url: str
    full_url: Optional[str] = None


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


class PaginatedHistory(BaseModel):
    items: List[HistoryEntry]
    total: int
    page: int
    page_size: int


class HealthResponse(BaseModel):
    status: str


class DeleteResponse(BaseModel):
    deleted: str


class PaginatedImages(BaseModel):
    items: List[ImageItem]
    total: int
    page: int
    page_size: int


class PaginatedSearchResult(BaseModel):
    query: str
    items: List[ImageItem]
    scores: Dict[str, float]
    total: int
    page: int
    page_size: int