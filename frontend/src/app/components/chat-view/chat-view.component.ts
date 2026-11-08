import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DocumentService } from '../../services/document.service';
import { ChatService } from '../../services/chat.service';
import { DocumentItem } from '../../models/document.model';
import { ChatMessage, Citation } from '../../models/chat.model';

@Component({
  selector: 'app-chat-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="chat-layout animate-fade-in">
      <!-- Left Sidebar: Document Selection & Context -->
      <aside class="sidebar-panel">
        <div class="sidebar-header">
          <h3>Active Documents</h3>
          <a routerLink="/upload" class="btn btn-sm btn-primary" title="Upload new document">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add PDF
          </a>
        </div>

        <div class="doc-list-sidebar">
          <div *ngIf="loadingDocs" class="doc-loading">Loading documents...</div>

          <div
            *ngFor="let doc of documents"
            class="doc-item"
            [class.active]="selectedDoc?.id === doc.id"
            (click)="selectDocument(doc)"
          >
            <div class="doc-item-icon">PDF</div>
            <div class="doc-item-details">
              <div class="doc-item-title">{{ doc.title }}</div>
              <div class="doc-item-sub">{{ doc.pageCount }} pages &bull; {{ doc.chunkCount }} chunks</div>
            </div>
          </div>

          <div *ngIf="!loadingDocs && documents.length === 0" class="no-docs-hint">
            <p>No documents uploaded yet.</p>
            <a routerLink="/upload" class="link-highlight">Upload a PDF now</a>
          </div>
        </div>

        <!-- Selected Document Metadata Card -->
        <div class="active-doc-card" *ngIf="selectedDoc">
          <div class="card-head">
            <span class="active-tag">Active Context</span>
            <span class="badge badge-ready">Indexed</span>
          </div>
          <h4>{{ selectedDoc.title }}</h4>
          <p class="file-name">{{ selectedDoc.originalFilename }}</p>

          <div class="meta-row">
            <span>Pages: <strong>{{ selectedDoc.pageCount }}</strong></span>
            <span>Chunks: <strong>{{ selectedDoc.chunkCount }}</strong></span>
          </div>

          <div class="quick-summary" *ngIf="selectedDoc.summary">
            <strong>Overview:</strong>
            <p>{{ selectedDoc.summary }}</p>
          </div>
        </div>
      </aside>

      <!-- Center / Right: Chat Conversation Workspace -->
      <main class="chat-workspace">
        <!-- Chat Header -->
        <div class="chat-top-bar" *ngIf="selectedDoc">
          <div class="chat-doc-info">
            <div class="status-indicator"></div>
            <div>
              <h2>Querying: {{ selectedDoc.title }}</h2>
              <span class="doc-subtitle">{{ selectedDoc.originalFilename }} &bull; RAG Vector Search Active</span>
            </div>
          </div>

          <div class="chat-actions">
            <button (click)="exportChat()" class="btn btn-outline btn-sm" [disabled]="messages.length === 0" title="Export conversation as Markdown">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export Chat
            </button>
            <button (click)="clearChat()" class="btn btn-outline btn-sm" [disabled]="messages.length === 0" title="Clear conversation history">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              Clear
            </button>
          </div>
        </div>

        <!-- Chat Messages Container -->
        <div class="chat-messages-container" #scrollContainer>
          <!-- When no document selected -->
          <div class="empty-chat" *ngIf="!selectedDoc && !loadingDocs">
            <div class="empty-icon-circle">
              <svg width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </div>
            <h3>Select a Document to Begin</h3>
            <p>Pick a document from the sidebar or upload a new PDF to start an intelligent Q&amp;A session.</p>
          </div>

          <!-- When document is selected but no messages yet -->
          <div class="empty-chat" *ngIf="selectedDoc && messages.length === 0 && !asking">
            <div class="empty-icon-circle ai-bot-circle">
              <svg width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><rect width="18" height="12" x="3" y="8" rx="3"/><path d="M9 13v2M15 13v2"/></svg>
            </div>
            <h3>What would you like to know about "{{ selectedDoc.title }}"?</h3>
            <p>Ask anything about numbers, dates, parties, terms, or ask for a high-level summary.</p>

            <div class="suggested-prompts">
              <button *ngFor="let prompt of suggestedPrompts" (click)="askPrompt(prompt)" class="prompt-chip">
                <span>{{ prompt }}</span>
                <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>

          <!-- Message Thread -->
          <div class="message-thread" *ngIf="selectedDoc">
            <div *ngFor="let msg of messages" class="message-bubble-group">
              <!-- User Question -->
              <div class="user-row">
                <div class="user-bubble">
                  <p>{{ msg.question }}</p>
                  <span class="bubble-time">{{ msg.timestamp | date:'shortTime' }}</span>
                </div>
              </div>

              <!-- AI Answer -->
              <div class="ai-row">
                <div class="ai-avatar">AI</div>
                <div class="ai-bubble">
                  <div class="ai-text-content" [innerHTML]="formatMarkdown(msg.answer)"></div>

                  <!-- Citations Section -->
                  <div class="citations-container" *ngIf="msg.citations && msg.citations.length > 0">
                    <div class="citations-header">
                      <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                      <span>Verified Sources &amp; Citations:</span>
                    </div>
                    <div class="citation-badges">
                      <button
                        *ngFor="let cit of msg.citations"
                        (click)="activeCitation = cit"
                        class="citation-pill"
                        title="Click to view extracted chunk text"
                      >
                        Page {{ cit.pageNumber }} (Chunk #{{ cit.chunkIndex + 1 }})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Asking / Typing Indicator -->
            <div class="ai-row" *ngIf="asking">
              <div class="ai-avatar pulse">AI</div>
              <div class="ai-bubble typing-bubble">
                <div class="dot-flashing"></div>
                <span class="typing-text">Searching document chunks &amp; generating answer...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Bar -->
        <div class="chat-input-bar" *ngIf="selectedDoc">
          <form (ngSubmit)="sendQuestion()" class="input-form">
            <textarea
              [(ngModel)]="currentQuestion"
              name="currentQuestion"
              (keydown.enter)="onEnterPress($event)"
              placeholder="Ask a question about this document (e.g., 'What is the expiration date?', 'Summarize key clauses')..."
              rows="1"
              class="chat-textarea"
              [disabled]="asking"
            ></textarea>

            <button type="submit" class="btn btn-primary btn-send" [disabled]="!currentQuestion.trim() || asking">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              <span>Ask</span>
            </button>
          </form>
          <div class="input-footer">
            <span>Press <strong>Enter</strong> to send &bull; <strong>Shift + Enter</strong> for new line</span>
          </div>
        </div>
      </main>

      <!-- Right Drawer: Citation Inspector Modal -->
      <div class="modal-backdrop" *ngIf="activeCitation" (click)="activeCitation = null">
        <div class="modal-content citation-modal animate-fade-in" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3>Citation Source Inspector</h3>
              <p class="modal-sub">Page {{ activeCitation.pageNumber }} &bull; Chunk #{{ activeCitation.chunkIndex + 1 }} &bull; Match Score: {{ activeCitation.score || 'High' }}</p>
            </div>
            <button class="btn-close" (click)="activeCitation = null">&times;</button>
          </div>
          <div class="modal-body">
            <div class="citation-body">
              <div class="citation-quote-icon">“</div>
              <p class="citation-full-snippet">{{ activeCitation.snippet }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="activeCitation = null">Close</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      height: calc(100vh - 65px);
      background: #f8fafc;
      overflow: hidden;
    }
    @media (max-width: 860px) {
      .chat-layout {
        grid-template-columns: 1fr;
      }
      .sidebar-panel {
        display: none;
      }
    }
    /* Sidebar */
    .sidebar-panel {
      background: white;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .sidebar-header {
      padding: 1.25rem 1rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .sidebar-header h3 {
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
    }
    .doc-list-sidebar {
      flex: 1;
      overflow-y: auto;
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .doc-loading, .no-docs-hint {
      padding: 2rem 1rem;
      text-align: center;
      font-size: 0.85rem;
      color: #64748b;
    }
    .doc-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: 8px;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease;
    }
    .doc-item:hover {
      background: #f1f5f9;
    }
    .doc-item.active {
      background: #eef2ff;
      border-color: #c7d2fe;
    }
    .doc-item-icon {
      background: #fee2e2;
      color: #dc2626;
      font-weight: 800;
      font-size: 0.65rem;
      padding: 0.25rem 0.45rem;
      border-radius: 6px;
    }
    .doc-item-details {
      overflow: hidden;
    }
    .doc-item-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .doc-item-sub {
      font-size: 0.72rem;
      color: #94a3b8;
    }
    .active-doc-card {
      padding: 1rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }
    .card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.35rem;
    }
    .active-tag {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #4f46e5;
    }
    .active-doc-card h4 {
      font-size: 0.9rem;
      font-weight: 700;
      color: #0f172a;
    }
    .file-name {
      font-size: 0.75rem;
      color: #64748b;
      margin-bottom: 0.5rem;
    }
    .meta-row {
      display: flex;
      gap: 1rem;
      font-size: 0.75rem;
      color: #475569;
      margin-bottom: 0.5rem;
    }
    .quick-summary {
      font-size: 0.75rem;
      color: #334155;
      background: white;
      padding: 0.5rem;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      max-height: 80px;
      overflow-y: auto;
    }

    /* Workspace */
    .chat-workspace {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #f8fafc;
    }
    .chat-top-bar {
      padding: 0.85rem 1.75rem;
      background: white;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .chat-doc-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .status-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
    }
    .chat-doc-info h2 {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
    }
    .doc-subtitle {
      font-size: 0.78rem;
      color: #64748b;
    }
    .chat-actions {
      display: flex;
      gap: 0.5rem;
    }
    .btn-sm {
      padding: 0.4rem 0.75rem;
      font-size: 0.8rem;
    }

    /* Messages Container */
    .chat-messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .empty-chat {
      margin: auto;
      text-align: center;
      max-width: 520px;
      padding: 2rem;
    }
    .empty-icon-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #eef2ff;
      color: #4f46e5;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
    }
    .ai-bot-circle {
      background: linear-gradient(135deg, #4f46e5, #06b6d4);
      color: white;
    }
    .empty-chat h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }
    .empty-chat p {
      font-size: 0.9rem;
      color: #64748b;
      margin-bottom: 1.5rem;
    }
    .suggested-prompts {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .prompt-chip {
      background: white;
      border: 1px solid #e2e8f0;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #334155;
      font-size: 0.88rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: left;
    }
    .prompt-chip:hover {
      border-color: #4f46e5;
      background: #f8fafc;
      transform: translateX(3px);
      color: #4f46e5;
    }

    /* Thread styles */
    .message-thread {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 900px;
      margin: 0 auto;
      width: 100%;
    }
    .message-bubble-group {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }
    .user-row {
      display: flex;
      justify-content: flex-end;
    }
    .user-bubble {
      background: linear-gradient(135deg, #4f46e5, #4338ca);
      color: white;
      padding: 0.85rem 1.25rem;
      border-radius: 16px 16px 4px 16px;
      max-width: 75%;
      box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
    }
    .user-bubble p {
      font-size: 0.95rem;
      line-height: 1.5;
    }
    .bubble-time {
      display: block;
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.7);
      text-align: right;
      margin-top: 0.35rem;
    }
    .ai-row {
      display: flex;
      gap: 0.85rem;
      align-items: flex-start;
    }
    .ai-avatar {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0f172a, #334155);
      color: white;
      font-size: 0.75rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .ai-avatar.pulse {
      animation: pulseAvatar 1s infinite alternate;
    }
    @keyframes pulseAvatar {
      from { transform: scale(0.95); opacity: 0.7; }
      to { transform: scale(1.05); opacity: 1; }
    }
    .ai-bubble {
      background: white;
      border: 1px solid #e2e8f0;
      padding: 1.15rem 1.35rem;
      border-radius: 4px 16px 16px 16px;
      max-width: 85%;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    }
    .ai-text-content {
      font-size: 0.95rem;
      color: #1e293b;
      line-height: 1.65;
    }
    .citations-container {
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px dashed #e2e8f0;
    }
    .citations-header {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 0.45rem;
    }
    .citation-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }
    .citation-pill {
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      color: #4338ca;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.55rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .citation-pill:hover {
      background: #e0e7ff;
      border-color: #818cf8;
      transform: translateY(-1px);
    }
    .typing-bubble {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1.25rem;
    }
    .typing-text {
      font-size: 0.85rem;
      color: #64748b;
      font-style: italic;
    }
    .dot-flashing {
      width: 8px;
      height: 8px;
      border-radius: 5px;
      background-color: #4f46e5;
      animation: dotPulse 1s infinite alternate;
    }
    @keyframes dotPulse {
      0% { opacity: 0.3; }
      100% { opacity: 1; }
    }

    /* Input Bar */
    .chat-input-bar {
      padding: 1rem 1.75rem;
      background: white;
      border-top: 1px solid #e2e8f0;
      max-width: 900px;
      width: 100%;
      margin: 0 auto;
    }
    .input-form {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }
    .chat-textarea {
      flex: 1;
      padding: 0.75rem 1rem;
      font-size: 0.95rem;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      outline: none;
      resize: none;
      font-family: inherit;
      transition: border-color 0.15s;
    }
    .chat-textarea:focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
    }
    .btn-send {
      padding: 0.75rem 1.25rem;
      border-radius: 10px;
    }
    .input-footer {
      font-size: 0.72rem;
      color: #94a3b8;
      margin-top: 0.4rem;
      text-align: right;
    }

    /* Citation Modal */
    .citation-modal {
      max-width: 580px;
    }
    .citation-body {
      background: #f8fafc;
      border-left: 4px solid #4f46e5;
      padding: 1.25rem;
      border-radius: 0 8px 8px 0;
      position: relative;
    }
    .citation-quote-icon {
      font-size: 3rem;
      color: #cbd5e1;
      line-height: 1;
      position: absolute;
      top: -10px;
      left: 10px;
      font-family: Georgia, serif;
    }
    .citation-full-snippet {
      font-size: 0.92rem;
      color: #334155;
      line-height: 1.6;
      font-family: 'JetBrains Mono', monospace;
      white-space: pre-wrap;
    }
  `]
})
export class ChatViewComponent implements OnInit {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  documents: DocumentItem[] = [];
  selectedDoc: DocumentItem | null = null;
  messages: ChatMessage[] = [];
  currentQuestion = '';
  asking = false;
  loadingDocs = true;
  activeCitation: Citation | null = null;

  suggestedPrompts = [
    'What is the main topic and purpose of this document?',
    'Summarize key figures, amounts, and dates mentioned.',
    'List all parties, organizations, or individuals identified.',
    'Identify any compliance obligations, warnings, or terms.'
  ];

  constructor(
    private documentService: DocumentService,
    private chatService: ChatService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loadingDocs = true;
    this.documentService.getDocuments().subscribe({
      next: (docs) => {
        this.documents = docs;
        this.loadingDocs = false;

        const paramId = this.route.snapshot.paramMap.get('documentId');
        if (paramId) {
          const matched = docs.find(d => d.id === Number(paramId));
          if (matched) {
            this.selectDocument(matched);
            return;
          }
        }

        if (docs.length > 0 && !this.selectedDoc) {
          this.selectDocument(docs[0]);
        }
      },
      error: () => {
        this.loadingDocs = false;
      }
    });
  }

  selectDocument(doc: DocumentItem): void {
    this.selectedDoc = doc;
    this.messages = [];
    this.loadHistory(doc.id);
  }

  loadHistory(docId: number): void {
    this.chatService.getChatHistory(docId).subscribe({
      next: (history) => {
        this.messages = history;
        this.scrollToBottom();
      }
    });
  }

  askPrompt(prompt: string): void {
    this.currentQuestion = prompt;
    this.sendQuestion();
  }

  onEnterPress(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      event.preventDefault();
      this.sendQuestion();
    }
  }

  sendQuestion(): void {
    if (!this.selectedDoc || !this.currentQuestion.trim() || this.asking) return;

    const q = this.currentQuestion.trim();
    this.currentQuestion = '';
    this.asking = true;

    this.chatService.askQuestion(this.selectedDoc.id, q).subscribe({
      next: (resp) => {
        this.asking = false;
        this.messages.push(resp);
        this.scrollToBottom();
      },
      error: (err) => {
        this.asking = false;
        this.messages.push({
          documentId: this.selectedDoc!.id,
          question: q,
          answer: '⚠️ An error occurred while retrieving answer: ' + (err.error?.message || 'Server error'),
          citations: []
        });
        this.scrollToBottom();
      }
    });

    this.scrollToBottom();
  }

  clearChat(): void {
    if (!this.selectedDoc) return;
    if (confirm('Clear chat history for this document?')) {
      this.chatService.clearHistory(this.selectedDoc.id).subscribe({
        next: () => {
          this.messages = [];
        }
      });
    }
  }

  exportChat(): void {
    if (!this.selectedDoc || this.messages.length === 0) return;

    let content = `# AI Q&A Transcript: ${this.selectedDoc.title}\n`;
    content += `File: ${this.selectedDoc.originalFilename}\n`;
    content += `Export Date: ${new Date().toLocaleString()}\n\n---\n\n`;

    for (const msg of this.messages) {
      content += `### 👤 Question:\n${msg.question}\n\n`;
      content += `### 🤖 AI Answer:\n${msg.answer}\n\n`;
      if (msg.citations && msg.citations.length > 0) {
        content += `*Citations:* `;
        content += msg.citations.map(c => `[Page ${c.pageNumber}, Chunk ${c.chunkIndex}]`).join(', ');
        content += `\n\n`;
      }
      content += `---\n\n`;
    }

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.selectedDoc.title}_Chat_Transcript.md`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  formatMarkdown(text: string): string {
    if (!text) return '';
    return text
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.*$)/gim, '<strong>$1</strong>')
      .replace(/^• (.*$)/gim, '&bull; $1');
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.scrollContainer) {
          this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        }
      } catch {}
    }, 100);
  }
}

