import type { SearchResult, PaginatedHistory, PaginatedImages, PaginatedSearchResult } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  private buildQuery(params: Record<string, string | number>): string {
    return '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();
  }

  getSources(page = 1, pageSize = 20, signal?: AbortSignal): Promise<PaginatedImages> {
    const params: Record<string, string | number> = { page, page_size: pageSize };
    return this.request(`/sources${this.buildQuery(params)}`, { signal });
  }
  
  search(query: string, page = 1, pageSize = 20, signal?: AbortSignal): Promise<PaginatedSearchResult> {
    const params: Record<string, string | number> = { q: query, page, page_size: pageSize };
    return this.request(`/search${this.buildQuery(params)}`, { signal });
  }
  
  getSuggestions(query: string, signal?: AbortSignal): Promise<string[]> {
    return this.request(`/suggestions${this.buildQuery({ q: query })}`, { signal });
  }
  
  getHistory(page = 1, pageSize = 10, signal?: AbortSignal): Promise<PaginatedHistory> {
    return this.request(`/history${this.buildQuery({ page, page_size: pageSize })}`, { signal });
  }
  
  getHistoryResults(historyId: string, signal?: AbortSignal): Promise<SearchResult> {
    return this.request(`/history/${historyId}/results`, { signal });
  }
  
  deleteHistory(historyId: string): Promise<{ deleted: string }> {
    return this.request(`/history/${historyId}`, { method: 'DELETE' });
  }
}

export const api = new ApiClient();