export interface ImageItem {
  id: string;
  nasa_id: string;
  title: string;
  description: string;
  date_created: string;
  keywords: string[];
  preview_url: string;
}

export interface SearchResult {
  query: string;
  results: ImageItem[];
  scores: Record<string, number>;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  query: string;
  total: number;
  result_ids: string[];
  result_scores: Record<string, number>;
}

interface PaginationBase {
  total: number;
  page: number;
  page_size: number;
}

export interface PaginatedHistory extends PaginationBase {
  items: HistoryEntry[];
}

export interface PaginatedImages extends PaginationBase {
  items: ImageItem[];
}

export interface PaginatedSearchResult extends PaginationBase {
  query: string;
  items: ImageItem[];
  scores: Record<string, number>;
}