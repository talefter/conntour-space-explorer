import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ImageGrid } from '../components/ImageGrid';
import { SearchBar } from '../components/SearchBar';
import { HistoryModal } from '../components/HistoryModal';
import { Paginator } from '../components/Paginator';
import type { PaginatedImages, PaginatedSearchResult } from '../types';

const PAGE_SIZE = 20;

export const BrowsePage: React.FC = () => {
  const [browseData, setBrowseData] = useState<PaginatedImages | null>(null);
  const [searchData, setSearchData] = useState<PaginatedSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const isSearchMode = !!searchData;
  const currentData = searchData || browseData;
  const totalPages = currentData ? Math.ceil(currentData.total / PAGE_SIZE) : 0;

  useEffect(() => {
    const handleOpenHistoryModal = () => setShowHistoryModal(true);
    window.addEventListener('openHistoryModal', handleOpenHistoryModal);
    return () => window.removeEventListener('openHistoryModal', handleOpenHistoryModal);
  }, []);

  useEffect(() => {
    if (!isSearchMode) loadBrowseData(currentPage);
  }, [currentPage, isSearchMode]);

  const loadBrowseData = async (page: number) => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getSources(page, PAGE_SIZE);
      setBrowseData(data);
    } catch (err) {
      setError('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchQuery: string, page = 1) => {
    try {
      setLoading(true);
      setError('');
      const result = await api.search(searchQuery, page, PAGE_SIZE);
      setSearchData(result);
      setCurrentPage(page);
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = async () => {
    setLoading(true);
    setSearchData(null);
    setQuery('');
    setCurrentPage(1);
    await loadBrowseData(1);
  };

  const handlePageChange = (page: number) => {
    if (isSearchMode) {
      handleSearch(query, page);
    } else {
      setCurrentPage(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHistorySelect = (selectedQuery: string) => {
    setQuery(selectedQuery);
    handleSearch(selectedQuery, 1);
  };

  const handleHistoryChange = () => {
    setHistoryRefreshKey(prev => prev + 1);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>🚀 NASA Space Explorer 🌌</h1>
      </div>

      <div className="search-section">
        <SearchBar 
          onSearch={handleSearch} 
          onClear={clearSearch} 
          isLoading={loading}
          initialValue={query}
          onQueryChange={setQuery}
          refreshKey={historyRefreshKey}
        />
        
        {searchData && !loading && (
          <div className="search-info">
            Found {searchData.total} results for "{searchData.query}"
          </div>
        )}
      </div>
      
      <ImageGrid
        images={currentData?.items || []}
        scores={searchData?.scores}
        loading={loading}
        error={error || undefined}
      />
      
      {!loading && totalPages > 1 && (
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
        onHistoryChange={handleHistoryChange}
      />
    </div>
  );
};