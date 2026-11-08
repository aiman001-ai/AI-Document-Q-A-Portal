import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatMessage, ChatRequest } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = '/api/chat';

  constructor(private http: HttpClient) {}

  askQuestion(documentId: number, question: string): Observable<ChatMessage> {
    const payload: ChatRequest = { documentId, question };
    return this.http.post<ChatMessage>(`${this.apiUrl}/ask`, payload);
  }

  getChatHistory(documentId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/history/${documentId}`);
  }

  clearHistory(documentId: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/history/${documentId}`);
  }
}

