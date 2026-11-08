export interface Citation {
  chunkIndex: number;
  pageNumber: number;
  snippet: string;
  score?: number;
}

export interface ChatMessage {
  id?: number;
  documentId: number;
  question: string;
  answer: string;
  citations: Citation[];
  timestamp?: string;
  loading?: boolean;
}

export interface ChatRequest {
  documentId: number;
  question: string;
}

