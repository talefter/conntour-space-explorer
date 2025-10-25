import { ImageItem, SearchResult, PaginatedHistory, PaginatedImages, PaginatedSearchResult } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new ApiError(`HTTP ${response.status}`, response.status);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      throw new ApiError('Network error');
    }
  }

  async getSources(page = 1, pageSize = 20, signal?: AbortSignal): Promise<PaginatedImages> {
    return this.request(`${API_BASE}/sources?page=${page}&page_size=${pageSize}`, { signal });
  }
  
  async search(query: string, page = 1, pageSize = 20, signal?: AbortSignal): Promise<PaginatedSearchResult> {
    return this.request(`${API_BASE}/search?q=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}`, { signal });
  }
  
  async getSuggestions(query: string, signal?: AbortSignal): Promise<string[]> {
    return this.request(`${API_BASE}/suggestions?q=${encodeURIComponent(query)}`, { signal });
  }
  
  async getHistory(page = 1, pageSize = 10, signal?: AbortSignal): Promise<PaginatedHistory> {
    return this.request(`${API_BASE}/history?page=${page}&page_size=${pageSize}`, { signal });
  }
  
  async getHistoryResults(historyId: string, signal?: AbortSignal): Promise<SearchResult> {
    return this.request(`${API_BASE}/history/${historyId}/results`, { signal });
  }
  
  async deleteHistory(historyId: string): Promise<{ deleted: string }> {
    return this.request(`${API_BASE}/history/${historyId}`, { method: 'DELETE' });
  }
}

export const api = new ApiClient();