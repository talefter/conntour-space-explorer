import React, { useCallback, useEffect, useState } from 'react';
import { useAsyncOperation } from '../../hooks/useAsyncOperation';
import { api } from '../../services/api';
import { Paginator } from '../Paginator';
import { PaginatedHistory } from '../../types';
import { formatTimestamp } from '../../utils/dateUtils';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuery: (query: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, onSelectQuery }) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const loadHistoryFn = useCallback((page: number, signal?: AbortSignal) => 
    api.getHistory(page, 5, signal), []
  );
  
  const { state, execute } = useAsyncOperation<PaginatedHistory>(loadHistoryFn);

  const loadHistory = useCallback((page: number) => {
    setCurrentPage(page);
    execute(page);
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
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const handleRerun = (query: string) => {
    onSelectQuery(query);
    onClose();
  };

  if (!isOpen) return null;

  const totalPages = state.data ? Math.ceil(state.data.total / state.data.page_size) : 0;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="history-modal">
        <div className="history-modal-header">
          <h2>🕒 Search History</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="history-modal-content">
          {state.loading && !state.data && (
            <div className="loading-state">Loading history...</div>
          )}

          {state.error && (
            <div className="error-message">{state.error}</div>
          )}

          {!state.data || state.data.items.length === 0 ? (
            <div className="empty-state">No search history found</div>
          ) : (
            <div className="history-list">
              {state.data.items.map((entry) => (
                <div 
                  key={entry.id} 
                  className="history-item"
                  onClick={() => handleRerun(entry.query)}
                >
                  <div className="history-item__content">
                    <div className="history-item__icon">
                      🔍
                    </div>
                    <div className="history-item__info">
                      <div className="history-item__query">{entry.query}</div>
                      <div className="history-item__meta">
                        {formatTimestamp(entry.timestamp)} • {entry.total} results
                      </div>
                    </div>
                  </div>
                  <div className="history-item__actions">
                    <button
                      className="btn-icon btn-icon--delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(entry.id);
                      }}
                      title="Delete entry"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {state.data && state.data.items.length > 0 && (
          <div className="history-modal-footer">
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