import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentChunk, DocumentItem } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = '/api/documents';

  constructor(private http: HttpClient) {}

  uploadDocument(file: File): Observable<DocumentItem> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<DocumentItem>(`${this.apiUrl}/upload`, formData);
  }

  getDocuments(): Observable<DocumentItem[]> {
    return this.http.get<DocumentItem[]>(this.apiUrl);
  }

  getDocumentById(id: number): Observable<DocumentItem> {
    return this.http.get<DocumentItem>(`${this.apiUrl}/${id}`);
  }

  getDocumentChunks(id: number): Observable<DocumentChunk[]> {
    return this.http.get<DocumentChunk[]>(`${this.apiUrl}/${id}/chunks`);
  }

  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' });
  }

  deleteDocument(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}

