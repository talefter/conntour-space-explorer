export interface ImageItem {
  id: string;
  nasa_id: string;
  title: string;
  description?: string;
  date_created?: string;
  keywords: string[];
  preview_url: string;
  full_url?: string;
}

export interface SearchResult {
  query: string;
  results: ImageItem[];
  scores: { [imageId: string]: number };
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  query: string;
  total: number;
  result_ids: string[];
  result_scores: { [imageId: string]: number };
}

export interface PaginatedHistory {
  items: HistoryEntry[];
  total: number;
  page: number;
  page_size: number;
}

export interface PaginatedImages {
  items: ImageItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface PaginatedSearchResult {
  query: string;
  items: ImageItem[];
  scores: { [imageId: string]: number };
  total: number;
  page: number;
  page_size: number;
}