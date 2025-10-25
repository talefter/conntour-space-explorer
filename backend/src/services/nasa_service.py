import asyncio
import json
import os
import time
from typing import List

import httpx

from ..models.schemas import ImageItem


class NASAService:
    def __init__(self, cache_file: str = "data/cache.json"):
        self.cache_file = cache_file
        self.cache_duration = 86400  # 24 hours
        self.base_url = "https://images-api.nasa.gov/search"
        self.max_retries = 3
        self.retry_delay = 1.0
    
    async def fetch_page(self, page: int, page_size: int) -> List[ImageItem]:
        """Fetch a single page from NASA API for background loading."""
        async with httpx.AsyncClient(timeout=30.0) as client:
            for attempt in range(self.max_retries):
                try:
                    response = await client.get(
                        self.base_url,
                        params={
                            "media_type": "image",
                            "page": page,
                            "page_size": min(page_size, 100)  # NASA API max is 100
                        }
                    )
                    
                    if response.status_code == 429:
                        await asyncio.sleep(2.0)
                        continue
                    
                    if response.status_code != 200:
                        continue
                        
                    data = response.json()
                    return self._parse_nasa_response(data)
                    
                except Exception as e:
                    if attempt == self.max_retries - 1:
                        print(f"Failed to fetch page {page}: {e}")
                        return []
                    await asyncio.sleep(self.retry_delay * (2 ** attempt))
        
        return []
    
    async def search_nasa_api(self, query: str, limit: int = 50) -> List[ImageItem]:
        """Search NASA API directly for fallback when cache has no results."""
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(
                    self.base_url,
                    params={
                        "q": query,
                        "media_type": "image",
                        "page_size": min(limit, 100)
                    }
                )
                
                if response.status_code != 200:
                    return []
                
                data = response.json()
                return self._parse_nasa_response(data)
                
            except Exception as e:
                print(f"NASA API search failed: {e}")
                return []
    
    def _parse_nasa_response(self, data: dict) -> List[ImageItem]:
        """Parse NASA API response into ImageItem objects."""
        api_items = data.get('collection', {}).get('items', [])
        
        images = []
        for item in api_items:
            nasa_data = item.get('data', [{}])[0]
            nasa_id = nasa_data.get('nasa_id', '')
            
            if not nasa_id:
                continue
            
            preview_url = self._extract_preview_url(item.get('links', []))
            if not preview_url:
                continue
            
            images.append(ImageItem(
                id=nasa_id.replace('-', '_'),
                nasa_id=nasa_id,
                title=nasa_data.get('title', ''),
                description=nasa_data.get('description', ''),
                date_created=nasa_data.get('date_created', ''),
                keywords=nasa_data.get('keywords', []),
                preview_url=preview_url,
                full_url=preview_url
            ))
        
        return images
    
    def _extract_preview_url(self, links: List[dict]) -> str:
        """Extract preview URL from links."""
        for link in links:
            if link.get('rel') == 'preview':
                return link.get('href', '')
        return ""
    
    def _load_from_cache(self) -> List[ImageItem]:
        """Load images from cache file."""
        try:
            with open(self.cache_file, 'r') as f:
                cache_data = json.load(f)
                return [ImageItem(**item) for item in cache_data['items']]
        except Exception:
            return []
    
    def _save_to_cache(self, images: List[ImageItem]) -> None:
        """Save images to cache file."""
        os.makedirs(os.path.dirname(self.cache_file), exist_ok=True)
        cache_data = {
            'ts': int(time.time()),
            'items': [img.dict() for img in images]
        }
        with open(self.cache_file, 'w') as f:
            json.dump(cache_data, f, separators=(',', ':'))