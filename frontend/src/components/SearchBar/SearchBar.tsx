import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { api } from '../../services/api';

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

  // Sync internal state when initialValue changes
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const updateQuery = (newQuery: string) => {
    setQuery(newQuery);
    onQueryChange?.(newQuery);
  };
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(query, 150);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length === 0) {
        // Show recent searches when query is empty
        try {
          const results = await api.getSuggestions('');
          setSuggestions(results.slice(0, 3));
        } catch (error) {
          setSuggestions([]);
        }
      } else {
        // Show matching suggestions
        try {
          const results = await api.getSuggestions(debouncedQuery);
          setSuggestions(results);
        } catch (error) {
          setSuggestions([]);
        }
      }
    };
    fetchSuggestions();
  }, [debouncedQuery]);

  const handleFocus = async () => {
    if (query === '') {
      try {
        const results = await api.getSuggestions('');
        setSuggestions(results.slice(0, 3)); // Show only 3 recent results
      } catch (error) {
        setSuggestions([]);
      }
    }
    setShowSuggestions(true);
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
    if (value === '' && onClear) {
      onClear();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    updateQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
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
            onFocus={handleFocus}
          />
          <button type="submit" className="search-button" disabled={isLoading}>
            {isLoading ? (
              <div className="spinner-small" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            )}
          </button>
        </div>
        {showSuggestions && (
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
              <div 
                className="search-history-btn"
                onClick={() => {
                  setShowSuggestions(false);
                  window.dispatchEvent(new CustomEvent('openHistoryModal'));
                }}
              >
                See more search history
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};