import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DocumentService } from '../../services/document.service';
import { DocumentChunk, DocumentItem } from '../../models/document.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container-portal dashboard-container animate-fade-in">
      <div class="dash-header">
        <div>
          <h1 class="dash-title">Document Intelligence Center</h1>
          <p class="dash-subtitle">Manage indexed files, inspect semantic vector chunks, and start contextual Q&amp;A sessions.</p>
        </div>
        <div class="dash-actions">
          <a routerLink="/upload" class="btn btn-primary">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Upload New PDF
          </a>
          <a routerLink="/chat" class="btn btn-secondary">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            Open Chat
          </a>
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="stats-grid">
        <div class="portal-card stat-card">
          <div class="stat-icon icon-indigo">
            <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div>
            <div class="stat-value">{{ documents.length }}</div>
            <div class="stat-label">Total Documents</div>
          </div>
        </div>

        <div class="portal-card stat-card">
          <div class="stat-icon icon-cyan">
            <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          </div>
          <div>
            <div class="stat-value">{{ totalPages }}</div>
            <div class="stat-label">Pages Extracted</div>
          </div>
        </div>

        <div class="portal-card stat-card">
          <div class="stat-icon icon-emerald">
            <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div>
            <div class="stat-value">{{ totalChunks }}</div>
            <div class="stat-label">Indexed Chunks</div>
          </div>
        </div>

        <div class="portal-card stat-card">
          <div class="stat-icon icon-purple">
            <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <div class="stat-value">JWT Auth</div>
            <div class="stat-label">Access Control</div>
          </div>
        </div>
      </div>

      <!-- Main Documents Panel -->
      <div class="portal-card doc-table-card">
        <div class="table-header-bar">
          <div class="search-box">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search documents by name or title..."
              class="search-input"
            />
          </div>
          <button (click)="loadDocuments()" class="btn btn-outline btn-sm">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            Refresh
          </button>
        </div>

        <!-- Loading State -->
        <div class="loading-state" *ngIf="loading">
          <div class="spinner"></div>
          <p>Loading document records...</p>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="!loading && filteredDocuments.length === 0">
          <div class="empty-icon">
            <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <h3>No documents indexed yet</h3>
          <p>Upload a PDF document to start querying with the AI assistant.</p>
          <a routerLink="/upload" class="btn btn-primary" style="margin-top: 1rem;">
            Upload Your First PDF
          </a>
        </div>

        <!-- Table -->
        <div class="table-wrapper" *ngIf="!loading && filteredDocuments.length > 0">
          <table class="doc-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Pages</th>
                <th>Chunks</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th>Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let doc of filteredDocuments">
                <td>
                  <div class="doc-title-cell">
                    <div class="doc-icon">PDF</div>
                    <div>
                      <div class="doc-name">{{ doc.title }}</div>
                      <div class="doc-file-sub">{{ doc.originalFilename }}</div>
                    </div>
                  </div>
                </td>
                <td><span class="page-pill">{{ doc.pageCount }} pages</span></td>
                <td><span class="chunk-pill">{{ doc.chunkCount }} chunks</span></td>
                <td>{{ formatFileSize(doc.fileSize) }}</td>
                <td>{{ doc.uploadTime | date:'shortDate' }}</td>
                <td>
                  <span class="badge badge-ready">Ready</span>
                </td>
                <td class="text-right action-btns">
                  <a [routerLink]="['/chat', doc.id]" class="btn-action btn-action-chat" title="Chat with Document">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    Chat
                  </a>
                  <button (click)="openPreview(doc)" class="btn-action" title="Preview Chunks &amp; Summary">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                  <button (click)="downloadPdf(doc)" class="btn-action" title="Download Original PDF">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </button>
                  <button (click)="deleteDoc(doc)" class="btn-action btn-action-del" title="Delete Document">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Preview Modal -->
      <div class="modal-backdrop" *ngIf="previewDoc" (click)="closePreview()">
        <div class="modal-content animate-fade-in" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3>{{ previewDoc.title }}</h3>
              <p class="modal-sub">{{ previewDoc.originalFilename }} &bull; {{ previewDoc.pageCount }} Pages &bull; {{ previewChunks.length }} Vector Chunks</p>
            </div>
            <button class="btn-close" (click)="closePreview()">&times;</button>
          </div>

          <div class="modal-body">
            <div class="preview-section" *ngIf="previewDoc.summary">
              <h4>Auto-Generated Summary</h4>
              <p class="summary-box">{{ previewDoc.summary }}</p>
            </div>

            <div class="preview-section">
              <h4>Extracted Semantic Chunks ({{ previewChunks.length }})</h4>
              <div class="chunks-list">
                <div class="chunk-card" *ngFor="let chunk of previewChunks">
                  <div class="chunk-meta">
                    <span class="badge badge-indigo">Chunk #{{ chunk.chunkIndex + 1 }}</span>
                    <span class="badge badge-ready">Page {{ chunk.pageNumber }}</span>
                    <span class="char-count">{{ chunk.characterCount }} chars</span>
                  </div>
                  <div class="chunk-content">{{ chunk.content }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <a [routerLink]="['/chat', previewDoc.id]" (click)="closePreview()" class="btn btn-primary">
              Start Chat with Document
            </a>
            <button class="btn btn-secondary" (click)="closePreview()">Close</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2.5rem 1.5rem;
    }
    .dash-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      gap: 1rem;
    }
    .dash-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .dash-subtitle {
      color: #64748b;
      font-size: 0.95rem;
      margin-top: 0.35rem;
    }
    .dash-actions {
      display: flex;
      gap: 0.75rem;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-indigo { background: #eef2ff; color: #4f46e5; }
    .icon-cyan { background: #ecfeff; color: #0891b2; }
    .icon-emerald { background: #ecfdf5; color: #059669; }
    .icon-purple { background: #faf5ff; color: #9333ea; }
    .stat-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
    }
    .stat-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .doc-table-card {
      background: white;
      overflow: hidden;
    }
    .table-header-bar {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .search-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #f8fafc;
      border: 1px solid var(--border);
      padding: 0.5rem 0.85rem;
      border-radius: 8px;
      width: 100%;
      max-width: 380px;
      color: #64748b;
    }
    .search-input {
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.9rem;
      color: #0f172a;
      width: 100%;
    }
    .loading-state, .empty-state {
      padding: 4rem 2rem;
      text-align: center;
    }
    .empty-icon {
      width: 72px;
      height: 72px;
      margin: 0 auto 1rem;
      background: #f1f5f9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
    }
    .empty-state h3 {
      font-size: 1.2rem;
      color: #1e293b;
      margin-bottom: 0.35rem;
    }
    .empty-state p {
      color: #64748b;
      font-size: 0.9rem;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #e2e8f0;
      border-top-color: #4f46e5;
      border-radius: 50%;
      margin: 0 auto 1rem;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .table-wrapper {
      overflow-x: auto;
    }
    .doc-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .doc-table th {
      padding: 0.85rem 1.25rem;
      background: #f8fafc;
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--border);
    }
    .doc-table td {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.88rem;
      color: #334155;
    }
    .doc-table tbody tr:hover {
      background: #f8fafc;
    }
    .doc-title-cell {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .doc-icon {
      background: #fee2e2;
      color: #dc2626;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.35rem 0.5rem;
      border-radius: 6px;
      letter-spacing: 0.05em;
    }
    .doc-name {
      font-weight: 700;
      color: #0f172a;
    }
    .doc-file-sub {
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .page-pill, .chunk-pill {
      background: #f1f5f9;
      padding: 0.25rem 0.55rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #475569;
    }
    .text-right {
      text-align: right;
    }
    .action-btns {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.4rem;
    }
    .btn-action {
      background: #f8fafc;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 0.45rem 0.6rem;
      cursor: pointer;
      color: #475569;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.15s;
    }
    .btn-action:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
    .btn-action-chat {
      background: #eef2ff;
      border-color: #c7d2fe;
      color: #4f46e5;
    }
    .btn-action-chat:hover {
      background: #e0e7ff;
      color: #3730a3;
    }
    .btn-action-del:hover {
      background: #fee2e2;
      border-color: #fca5a5;
      color: #dc2626;
    }
    /* Modal styles */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .modal-content {
      background: white;
      border-radius: 16px;
      max-width: 780px;
      width: 100%;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    .modal-header {
      padding: 1.5rem 1.75rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .modal-header h3 {
      font-size: 1.3rem;
      color: #0f172a;
      font-weight: 700;
    }
    .modal-sub {
      font-size: 0.85rem;
      color: #64748b;
      margin-top: 0.25rem;
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 1.75rem;
      color: #94a3b8;
      cursor: pointer;
      line-height: 1;
    }
    .btn-close:hover {
      color: #0f172a;
    }
    .modal-body {
      padding: 1.75rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .preview-section h4 {
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475569;
      margin-bottom: 0.75rem;
    }
    .summary-box {
      background: #f8fafc;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid var(--border);
      font-size: 0.9rem;
      color: #334155;
      line-height: 1.6;
    }
    .chunks-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      max-height: 320px;
      overflow-y: auto;
    }
    .chunk-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem;
    }
    .chunk-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .char-count {
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .chunk-content {
      font-size: 0.85rem;
      color: #334155;
      line-height: 1.5;
      background: #f8fafc;
      padding: 0.65rem 0.85rem;
      border-radius: 6px;
      font-family: monospace;
    }
    .modal-footer {
      padding: 1.25rem 1.75rem;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  documents: DocumentItem[] = [];
  loading = true;
  searchQuery = '';

  previewDoc: DocumentItem | null = null;
  previewChunks: DocumentChunk[] = [];

  constructor(private documentService: DocumentService, private router: Router) { }

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading = true;
    this.documentService.getDocuments().subscribe({
      next: (docs) => {
        this.documents = docs;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get filteredDocuments(): DocumentItem[] {
    if (!this.searchQuery.trim()) return this.documents;
    const q = this.searchQuery.toLowerCase();
    return this.documents.filter(d =>
      d.title.toLowerCase().includes(q) || d.originalFilename.toLowerCase().includes(q)
    );
  }

  get totalPages(): number {
    return this.documents.reduce((acc, doc) => acc + (doc.pageCount || 0), 0);
  }

  get totalChunks(): number {
    return this.documents.reduce((acc, doc) => acc + (doc.chunkCount || 0), 0);
  }

  openPreview(doc: DocumentItem): void {
    this.previewDoc = doc;
    this.previewChunks = [];
    this.documentService.getDocumentChunks(doc.id).subscribe({
      next: (chunks) => {
        this.previewChunks = chunks;
      }
    });
  }

  closePreview(): void {
    this.previewDoc = null;
    this.previewChunks = [];
  }

  downloadPdf(doc: DocumentItem): void {
    this.documentService.downloadDocument(doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.originalFilename;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  deleteDoc(doc: DocumentItem): void {
    if (confirm(`Are you sure you want to delete "${doc.title}"? This cannot be undone.`)) {
      this.documentService.deleteDocument(doc.id).subscribe({
        next: () => {
          this.documents = this.documents.filter(d => d.id !== doc.id);
        }
      });
    }
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

