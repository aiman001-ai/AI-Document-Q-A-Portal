export interface DocumentItem {
  id: number;
  title: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  pageCount: number;
  chunkCount: number;
  summary: string;
  status: string;
  uploadTime: string;
}

export interface DocumentChunk {
  id: number;
  chunkIndex: number;
  pageNumber: number;
  content: string;
  characterCount: number;
}

