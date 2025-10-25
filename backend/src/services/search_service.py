import re
from typing import Dict, List, Tuple

from rank_bm25 import BM25Okapi

from ..models.schemas import ImageItem


class SearchService:
    def __init__(self):
        self.bm25 = None
        self.images = []
        self._stop_words = frozenset({'the', 'a', 'an', 'and'})
    
    def build_index(self, images: List[ImageItem]) -> None:
        """Build BM25 search index using rank-bm25 library."""
        if not images:
            return
            
        self.images = images
        corpus = [self._tokenize(img) for img in images]
        self.bm25 = BM25Okapi(corpus, k1=1.2, b=0.75)
    
    def search(self, query: str) -> Tuple[List[ImageItem], Dict[str, float]]:
        """Search with BM25 scoring using rank-bm25 library."""
        if not query.strip() or not self.bm25:
            return [], {}
        
        query_tokens = self._normalize(query)
        if not query_tokens:
            return [], {}
        
        # Get BM25 scores from library
        scores = self.bm25.get_scores(query_tokens)
        
        # Apply custom boosting and filter results
        scored_results = []
        for i, (img, score) in enumerate(zip(self.images, scores)):
            if score > 0:
                boosted_score = self._boost_score(query, img, score)
                scored_results.append((img, boosted_score))
        
        if not scored_results:
            return [], {}
        
        # Sort by score
        scored_results.sort(key=lambda x: x[1], reverse=True)
        
        # Normalize scores to 0.01-1.0 range
        if len(scored_results) > 1:
            max_score = scored_results[0][1]
            min_score = scored_results[-1][1]
            score_range = max_score - min_score
            
            if score_range > 0:
                normalized_scores = {
                    img.id: round(max(0.01, (score - min_score) / score_range), 3)
                    for img, score in scored_results
                }
            else:
                normalized_scores = {img.id: 1.0 for img, _ in scored_results}
        else:
            normalized_scores = {scored_results[0][0].id: 1.0}
        
        return [img for img, _ in scored_results], normalized_scores
    
    def _tokenize(self, image: ImageItem) -> List[str]:
        """Extract and tokenize text from image metadata."""
        text_parts = image.keywords * 2  # Double weight for keywords
        
        if image.title:
            text_parts.extend([image.title] * 2)  # Double weight for title
        
        if image.description:
            text_parts.append(image.description)  # Include full description
        
        return self._normalize(" ".join(text_parts))
    
    def _normalize(self, text: str) -> List[str]:
        """Normalize and tokenize text."""
        if not text:
            return []
        
        tokens = re.findall(r'[a-z0-9]+', text.lower())
        return [t for t in tokens if t not in self._stop_words and (len(t) > 1 or t.isdigit())]
    
    def _boost_score(self, query: str, image: ImageItem, base_score: float) -> float:
        """Apply custom relevance boosts."""
        if base_score == 0:
            return base_score
        
        query_lower = query.lower().strip()
        boost = 1.0
        
        # Keyword exact match boost
        for keyword in image.keywords:
            if query_lower == keyword.lower():
                boost = max(boost, 5.0)
            elif query_lower in keyword.lower():
                boost = max(boost, 3.0)
        
        # Title match boost
        if image.title and query_lower in image.title.lower():
            boost = max(boost, 2.0)
        
        return base_score * boost