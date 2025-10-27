import React, { useCallback, useEffect, useState } from 'react';
import { useAsyncOperation } from '../hooks/useAsyncOperation';
import { api } from '../services/api';
import { Paginator } from './Paginator';
import type { PaginatedHistory, SearchResult } from '../types';
import { formatTimestamp } from '../utils/dateUtils';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuery: (query: string) => void;
  onSelectCachedResults?: (results: SearchResult) => void;
  onHistoryChange?: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, onSelectQuery, onSelectCachedResults, onHistoryChange }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isChangingPage, setIsChangingPage] = useState(false);
  
  const loadHistoryFn = useCallback((page: number, signal?: AbortSignal) => 
    api.getHistory(page, 10, signal), []
  );
  
  const { state, execute } = useAsyncOperation<PaginatedHistory>(loadHistoryFn);

  const loadHistory = useCallback(async (page: number) => {
    setIsChangingPage(true);
    setCurrentPage(page);
    await execute(page);
    setTimeout(() => setIsChangingPage(false), 200);
  }, [execute]);

  useEffect(() => {
    if (isOpen) {
      loadHistory(1);
    }
  }, [isOpen, loadHistory]);

  const handleDelete = async (historyId: string) => {
    try {
      await api.deleteHistory(historyId);
      loadHistory(currentPage);
      onHistoryChange?.();
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const handleRerun = async (entry: any) => {
    if (onSelectCachedResults) {
      try {
        const cachedResults = await api.getHistoryResults(entry.id);
        onSelectCachedResults(cachedResults);
        onClose();
        return;
      } catch {
      }
    }
    onSelectQuery(entry.query);
    onClose();
  };

  if (!isOpen) return null;

  const totalPages = state.data ? Math.ceil(state.data.total / state.data.page_size) : 1;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="history-table-modal">
        <div className="history-table-header">
          <div className="header-content">
            <h2>🔍 Search History</h2>
            <p>Your previous searches and results</p>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="history-table-content">
          {state.loading && !state.data && (
            <div className="loading-state">Loading history...</div>
          )}

          {state.error && (
            <div className="error-message">{state.error}</div>
          )}

          {!state.data || state.data.items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No search history</h3>
              <p>Your searches will appear here</p>
            </div>
          ) : (
            <div className={`history-table ${isChangingPage ? 'history-table--loading' : ''}`}>
              <div className="table-header">
                <div className="col-query">Search Query</div>
                <div className="col-date">Date</div>
                <div className="col-results">Results</div>
                <div className="col-actions">Actions</div>
              </div>
              
              <div className="table-body">
                {state.data.items.map((entry) => (
                  <div 
                    key={entry.id} 
                    className="table-row"
                    onClick={() => handleRerun(entry)}
                  >
                    <div className="col-query">
                      <span className="query-text">{entry.query}</span>
                    </div>
                    <div className="col-date">
                      {formatTimestamp(entry.timestamp)}
                    </div>
                    <div className="col-results">
                      {entry.total} images
                    </div>
                    <div className="col-actions">
                      <button
                        className="action-btn view-btn"
                        onClick={() => handleRerun(entry)}
                        title="View results"
                      >
                        👁️
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(entry.id);
                        }}
                        title="Delete entry"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {isChangingPage && (
                <div className="table-loading-overlay">
                  <div className="loading-spinner"></div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {state.data && state.data.items.length > 0 && (
          <div className="history-table-footer">
            <div className="pagination-info">
              Showing {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, state.data.total)} of {state.data.total} searches
            </div>
            <Paginator
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={loadHistory}
            />
          </div>
        )}
      </div>
    </div>
  );
};