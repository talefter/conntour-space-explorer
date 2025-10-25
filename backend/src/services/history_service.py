import json
import os
import time
import uuid
from typing import Dict, List, Optional

from ..models.schemas import HistoryEntry, ImageItem, PaginatedHistory


class HistoryService:
    def __init__(self, history_file: str = "data/history.json"):
        self.history_file = history_file
        self.history: List[HistoryEntry] = []
        self._load_history()
    
    def add_search(self, query: str, results: List[ImageItem], scores: Dict[str, float]) -> str:
        """Add search to history."""
        # Remove existing entry with same query to prevent duplicates
        self.history = [e for e in self.history if e.query != query]
        
        entry = HistoryEntry(
            id=str(uuid.uuid4()),
            timestamp=int(time.time()),
            query=query,
            total=len(results),
            result_ids=[img.id for img in results],
            result_scores=scores
        )
        
        self.history.append(entry)
        self._save_history()
        return entry.id
    
    def get_paginated(self, page: int = 1, page_size: int = 10) -> PaginatedHistory:
        """Get paginated history, most recent first."""
        start = (page - 1) * page_size
        items = list(reversed(self.history))[start:start + page_size]
        
        return PaginatedHistory(
            items=items,
            total=len(self.history),
            page=page,
            page_size=page_size
        )
    
    def get_entry(self, history_id: str) -> Optional[HistoryEntry]:
        """Get history entry by ID."""
        return next((e for e in self.history if e.id == history_id), None)
    
    def get_suggestions(self, query: str, limit: int = 5) -> List[str]:
        """Get search suggestions."""
        if not query.strip():
            seen = set()
            suggestions = []
            for entry in reversed(self.history):
                if entry.query not in seen and len(suggestions) < limit:
                    suggestions.append(entry.query)
                    seen.add(entry.query)
            return suggestions
        
        query_lower = query.lower()
        suggestions = []
        seen = set()
        
        for entry in reversed(self.history):
            if (entry.query.lower().startswith(query_lower) and 
                entry.query not in seen and len(suggestions) < limit):
                suggestions.append(entry.query)
                seen.add(entry.query)
        
        return suggestions
    
    def delete_entry(self, history_id: str) -> bool:
        """Delete history entry."""
        original_len = len(self.history)
        self.history = [e for e in self.history if e.id != history_id]
        
        if len(self.history) < original_len:
            self._save_history()
            return True
        return False
    
    def _load_history(self) -> None:
        """Load history from file."""
        if not os.path.exists(self.history_file):
            return
            
        try:
            with open(self.history_file, 'r') as f:
                data = json.load(f)
                self.history = [HistoryEntry(**entry) for entry in data]
        except Exception:
            self.history = []
    
    def _save_history(self) -> None:
        """Save history to file."""
        try:
            os.makedirs(os.path.dirname(self.history_file), exist_ok=True)
            with open(self.history_file, 'w') as f:
                json.dump([e.dict() for e in self.history], f, separators=(',', ':'))
        except Exception:
            pass