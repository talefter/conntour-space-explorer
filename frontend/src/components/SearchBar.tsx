import React, { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { api } from '../services/api';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear?: () => void;
  isLoading: boolean;
  placeholder?: string;
  initialValue?: string;
  onQueryChange?: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  onClear,
  isLoading, 
  placeholder = "Search NASA images...",
  initialValue = '',
  onQueryChange
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isFromHistory, setIsFromHistory] = useState(false);
  const debouncedQuery = useDebounce(query, 150);

  useEffect(() => {
    setQuery(initialValue);
    if (initialValue !== query) {
      setIsFromHistory(true);
      setTimeout(() => setIsFromHistory(false), 100);
    }
  }, [initialValue]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const results = await api.getSuggestions(debouncedQuery);
        setSuggestions(debouncedQuery ? results : results.slice(0, 3));
      } catch {
        setSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [debouncedQuery]);

  const updateQuery = (newQuery: string) => {
    setQuery(newQuery);
    onQueryChange?.(newQuery);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateQuery(value);
    
    if (!value.trim() && onClear && !isClearing) {
      setIsClearing(true);
      setTimeout(() => {
        onClear();
        setIsClearing(false);
      }, 300);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    updateQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const openHistoryModal = () => {
    setShowSuggestions(false);
    window.dispatchEvent(new CustomEvent('openHistoryModal'));
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onFocus={() => !isFromHistory && setShowSuggestions(true)}
          />
          <button type="submit" className="search-button" disabled={isLoading || isClearing}>
            {isLoading || isClearing ? (
              <div className="spinner-small" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            )}
          </button>
        </div>
        {showSuggestions && !isClearing && (
          <div className="search-suggestions">
            <div className="search-suggestions-scroll">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="search-suggestion"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))
              ) : (
                <div className="search-suggestion search-suggestion--empty">
                  No recent searches
                </div>
              )}
            </div>
            <div className="search-history-link">
              <div className="search-history-btn" onClick={openHistoryModal}>
                View Search History
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9,22 9,12 15,12 15,22" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};