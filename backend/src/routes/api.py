import asyncio
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query

from ..models.schemas import (
    DeleteResponse,
    HealthResponse,
    PaginatedHistory,
    PaginatedImages,
    PaginatedSearchResult,
    SearchResult,
)
from ..services.history_service import HistoryService
from ..services.nasa_service import NASAService
from ..services.search_service import SearchService

router = APIRouter()

# Service instances (singletons)
nasa_service = NASAService()
search_service = SearchService()
history_service = HistoryService()

# Application state
_search_initialized = False
_background_loading = False
all_images_cache = []

async def ensure_search_initialized():
    """Initialize search with background loading."""
    global _search_initialized, _background_loading, all_images_cache
    if not _search_initialized:
        _search_initialized = True
        
        # Start with cached images if available
        cached = nasa_service._load_from_cache()
        if cached:
            all_images_cache = cached
            search_service.build_index(cached)
            print(f"Search initialized with {len(cached)} cached images")
        else:
            # No cache - load first page immediately
            initial_images = await nasa_service.fetch_page(1, 100)
            if initial_images:
                all_images_cache = initial_images
                search_service.build_index(initial_images)
                print(f"Loaded {len(initial_images)} initial images")
        
        # Start background loading
        if not _background_loading:
            _background_loading = True
            asyncio.create_task(load_all_images())

async def load_all_images():
    """Load all images in background."""
    global all_images_cache
    try:
        all_images = []
        for page in range(1, 101):  # Load 10,000 images
            images = await nasa_service.fetch_page(page, 100)
            if not images:
                break
            all_images.extend(images)
            await asyncio.sleep(0.05)
            
            # Update cache every 10 pages
            if page % 10 == 0:
                all_images_cache = all_images.copy()
                search_service.build_index(all_images_cache)
                print(f"Background loaded {len(all_images)} images...")
        
        # Final update
        all_images_cache = all_images
        search_service.build_index(all_images_cache)
        nasa_service._save_to_cache(all_images)
        print(f"Background loading complete: {len(all_images)} images")
        
    except Exception as e:
        print(f"Background loading failed: {e}")


@router.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint."""
    return HealthResponse(status="ok")


@router.get("/sources", response_model=PaginatedImages)
async def get_sources(
    page: int = Query(1, ge=1), 
    page_size: int = Query(20, ge=1, le=100)
):
    """Get paginated images from background-loaded cache."""
    await ensure_search_initialized()
    
    total = len(all_images_cache)
    max_page = max(1, (total + page_size - 1) // page_size)
    
    if page > max_page:
        raise HTTPException(status_code=404, detail=f"Page {page} not found. Max page is {max_page}")
    
    start = (page - 1) * page_size
    end = start + page_size
    items = all_images_cache[start:end]
    
    return PaginatedImages(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/search", response_model=PaginatedSearchResult)
async def search_images(
    q: str = Query(..., min_length=1, max_length=200),
    page: int = Query(1, ge=1), 
    page_size: int = Query(20, ge=1, le=100)
):
    """Search images with confidence scores and NASA API fallback."""
    await ensure_search_initialized()
    
    # Try BM25 search on cached data first
    all_results, scores = search_service.search(q.strip())
    
    # Fallback to NASA API if no results from cache
    if not all_results:
        print(f"No BM25 results for '{q}', trying NASA API fallback...")
        nasa_results = await nasa_service.search_nasa_api(q.strip(), limit=100)
        
        if nasa_results:
            # Assign default confidence scores for NASA API results
            all_results = nasa_results
            scores = {img.id: 0.5 for img in nasa_results}  # 50% confidence for fallback
            print(f"NASA API fallback returned {len(nasa_results)} results")
    
    total_results = len(all_results)
    max_page = max(1, (total_results + page_size - 1) // page_size)
    
    if page > max_page:
        raise HTTPException(status_code=404, detail=f"Page {page} not found. Max page is {max_page}")
    
    # Paginate results
    start = (page - 1) * page_size
    end = start + page_size
    paginated_results = all_results[start:end]
    
    # Create paginated search result
    search_result = PaginatedSearchResult(
        query=q.strip(),
        items=paginated_results,
        scores=scores,
        total=total_results,
        page=page,
        page_size=page_size
    )
    
    # Add to history (async/non-blocking)
    history_service.add_search(q.strip(), all_results, scores)
    
    return search_result


@router.get("/history", response_model=PaginatedHistory)
async def get_history(
    page: int = Query(1, ge=1, le=1000), 
    page_size: int = Query(10, ge=1, le=100)
):
    """Get paginated search history."""
    return history_service.get_paginated(page, page_size)


@router.get("/history/{history_id}/results", response_model=SearchResult)
async def get_history_results(history_id: str):
    """Get exact snapshot of historical search."""
    history_entry = history_service.get_entry(history_id)
    if not history_entry:
        raise HTTPException(status_code=404, detail="History entry not found")
    
    await ensure_search_initialized()
    
    # Create lookup dict for O(1) access
    images_by_id = {img.id: img for img in all_images_cache}
    
    # Reconstruct results in exact order
    results = [
        images_by_id[img_id] 
        for img_id in history_entry.result_ids 
        if img_id in images_by_id
    ]
    
    return SearchResult(
        query=history_entry.query,
        results=results,
        scores=history_entry.result_scores
    )


@router.delete("/history/{history_id}", response_model=DeleteResponse)
async def delete_history(history_id: str):
    """Delete history entry."""
    if not history_service.delete_entry(history_id):
        raise HTTPException(status_code=404, detail="History entry not found")
    
    return DeleteResponse(deleted=history_id)


@router.get("/suggestions", response_model=List[str])
async def get_search_suggestions(q: str = ""):
    """Get search suggestions from history."""
    return history_service.get_suggestions(q, limit=5)