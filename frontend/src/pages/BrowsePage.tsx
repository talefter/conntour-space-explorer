import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ImageGrid } from '../components/ImageGrid';
import { SearchBar } from '../components/SearchBar';
import { HistoryModal } from '../components/HistoryModal';
import { Paginator } from '../components/Paginator';
import { ImageItem, SearchResult, PaginatedImages, PaginatedSearchResult } from '../types';

export const BrowsePage: React.FC = () => {
  const [paginatedImages, setPaginatedImages] = useState<PaginatedImages | null>(null);
  const [searchResult, setSearchResult] = useState<PaginatedSearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Listen for history modal open event
  useEffect(() => {
    const handleOpenHistoryModal = () => setShowHistoryModal(true);
    window.addEventListener('openHistoryModal', handleOpenHistoryModal);
    return () => window.removeEventListener('openHistoryModal', handleOpenHistoryModal);
  }, []);

  // Load images when page changes
  useEffect(() => {
    if (!searchResult) {
      loadImages(currentPage);
    }
  }, [currentPage, searchResult]);

  const loadImages = async (page: number) => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getSources(page, pageSize);
      setPaginatedImages(data);
    } catch (err) {
      setError('Failed to load images');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string, page = 1) => {
    const trimmedQuery = query.trim();
    
    try {
      setSearchLoading(true);
      setError('');
      const result = await api.search(trimmedQuery, page, pageSize);
      setSearchResult(result);
      setPaginatedImages(null);
      setCurrentPage(page);
    } catch (err) {
      setError('Search failed');
      setSearchResult(null);
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchResult(null);
    setCurrentSearchQuery('');
    setCurrentPage(1);
    loadImages(1);
  };

  const handleHistorySelect = (query: string) => {
    setCurrentSearchQuery(query);
    handleSearch(query, 1);
  };

  const handlePageChange = (page: number) => {
    if (searchResult) {
      // Search pagination
      handleSearch(currentSearchQuery, page);
    } else {
      // Browse pagination
      setCurrentPage(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayImages = searchResult ? searchResult.items : (paginatedImages?.items || []);
  const displayScores = searchResult ? searchResult.scores : undefined;
  const isSearching = searchLoading;
  const isLoading = loading && !searchResult;
  const totalPages = searchResult 
    ? Math.ceil(searchResult.total / pageSize) 
    : (paginatedImages ? Math.ceil(paginatedImages.total / pageSize) : 0);

  return (
    <div className="page">
      <div className="page-header">
        <h1>🚀 NASA Space Explorer 🌌</h1>
      </div>

      <div className="search-section">
        <SearchBar 
          onSearch={handleSearch} 
          onClear={clearSearch} 
          isLoading={isSearching}
          initialValue={currentSearchQuery}
          onQueryChange={setCurrentSearchQuery}
        />
        
        {searchResult && (
          <div className="search-info">
            <span>Found {searchResult.total} results for "{searchResult.query}" (showing {searchResult.items.length} on page {searchResult.page})</span>
          </div>
        )}
      </div>

      <ImageGrid
        images={displayImages}
        scores={displayScores}
        loading={isLoading || isSearching}
        error={error || undefined}
      />
      
      {(paginatedImages || searchResult) && totalPages > 1 && (
        <Paginator
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
      
      <HistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onSelectQuery={handleHistorySelect}
      />
    </div>
  );
};