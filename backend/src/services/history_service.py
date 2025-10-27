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
        self._id_index: Dict[str, HistoryEntry] = {}
        self._query_index: Dict[str, HistoryEntry] = {}
        self._reversed_cache: List[HistoryEntry] = []
        self._load_history()
    
    def add_search(self, query: str, results: List[ImageItem], scores: Dict[str, float]) -> str:
        """Add search to history."""
        # Remove existing entry with same query to prevent duplicates
        if query in self._query_index:
            old_entry = self._query_index[query]
            self.history.remove(old_entry)
            del self._id_index[old_entry.id]
            del self._query_index[query]
        
        entry = HistoryEntry(
            id=str(uuid.uuid4()),
            timestamp=int(time.time()),
            query=query,
            total=len(results),
            result_ids=[img.id for img in results],
            result_scores=scores
        )
        
        self.history.append(entry)
        self._id_index[entry.id] = entry
        self._query_index[entry.query] = entry
        self._reversed_cache = list(reversed(self.history))
        self._save_history()
        return entry.id
    
    def get_paginated(self, page: int = 1, page_size: int = 10) -> PaginatedHistory:
        """Get paginated history, most recent first."""
        start = (page - 1) * page_size
        items = self._reversed_cache[start:start + page_size]
        
        return PaginatedHistory(
            items=items,
            total=len(self.history),
            page=page,
            page_size=page_size
        )
    
    def get_entry(self, history_id: str) -> Optional[HistoryEntry]:
        """Get history entry by ID."""
        return self._id_index.get(history_id)
    
    def get_suggestions(self, query: str, limit: int = 5) -> List[str]:
        """Get search suggestions."""
        if not query.strip():
            seen = set()
            suggestions = []
            for entry in self._reversed_cache:
                if entry.query not in seen and len(suggestions) < limit:
                    suggestions.append(entry.query)
                    seen.add(entry.query)
            return suggestions
        
        query_lower = query.lower()
        suggestions = []
        seen = set()
        
        for entry in self._reversed_cache:
            if (entry.query.lower().startswith(query_lower) and 
                entry.query not in seen and len(suggestions) < limit):
                suggestions.append(entry.query)
                seen.add(entry.query)
        
        return suggestions
    
    def delete_entry(self, history_id: str) -> bool:
        """Delete history entry."""
        if history_id in self._id_index:
            entry = self._id_index[history_id]
            self.history.remove(entry)
            del self._id_index[history_id]
            del self._query_index[entry.query]
            self._reversed_cache = list(reversed(self.history))
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
                self._build_indexes()
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
    
    def _build_indexes(self) -> None:
        """Build indexes for fast lookups."""
        self._id_index = {e.id: e for e in self.history}
        self._query_index = {e.query: e for e in self.history}
        self._reversed_cache = list(reversed(self.history))