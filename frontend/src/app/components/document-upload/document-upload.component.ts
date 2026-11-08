import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DocumentService } from '../../services/document.service';
import { DocumentItem } from '../../models/document.model';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-portal upload-container animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">Upload &amp; Index Document</h1>
          <p class="page-subtitle">Upload PDF invoices, KYC reports, policies, or contracts for instant AI analysis and question answering.</p>
        </div>
        <a routerLink="/dashboard" class="btn btn-outline">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
          Back to Documents
        </a>
      </div>

      <div class="upload-grid">
        <!-- Upload Dropzone Card -->
        <div class="portal-card upload-card">
          <div
            class="dropzone"
            [class.dragover]="isDragging"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)"
            (click)="fileInput.click()"
          >
            <input
              #fileInput
              type="file"
              accept=".pdf,application/pdf"
              (change)="onFileSelected($event)"
              style="display: none"
            />

            <div class="dropzone-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>

            <h3>Drag &amp; Drop PDF Document Here</h3>
            <p class="dropzone-hint">Supports PDF files up to 25 MB with automatic OCR/text extraction</p>

            <button type="button" class="btn btn-primary btn-select" (click)="$event.stopPropagation(); fileInput.click()">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
              Select PDF File
            </button>
          </div>

          <!-- Upload Progress Banner -->
          <div class="progress-box" *ngIf="uploading">
            <div class="progress-info">
              <span class="file-name">Processing {{ selectedFile?.name }}...</span>
              <span class="status-tag">Parsing PDF &amp; Generating Chunks...</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill"></div>
            </div>
          </div>

          <!-- Error Message Banner -->
          <div class="alert alert-error" *ngIf="errorMessage">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Success Details Card -->
          <div class="success-card animate-fade-in" *ngIf="uploadedDoc">
            <div class="success-header">
              <div class="success-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <h4>Document Successfully Indexed!</h4>
                <p>Extracted full text, segmented into semantic chunks, and ready for queries.</p>
              </div>
            </div>

            <div class="doc-meta-grid">
              <div class="meta-item">
                <span class="meta-label">Title</span>
                <span class="meta-val">{{ uploadedDoc.title }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Pages</span>
                <span class="meta-val">{{ uploadedDoc.pageCount }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Chunks Indexed</span>
                <span class="meta-val">{{ uploadedDoc.chunkCount }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">File Size</span>
                <span class="meta-val">{{ formatFileSize(uploadedDoc.fileSize) }}</span>
              </div>
            </div>

            <div class="summary-preview" *ngIf="uploadedDoc.summary">
              <span class="summary-title">Extracted Overview:</span>
              <p class="summary-text">{{ uploadedDoc.summary }}</p>
            </div>

            <div class="action-row">
              <button class="btn btn-primary" (click)="openChatWithDoc(uploadedDoc.id)">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                Ask Questions About This PDF
              </button>
              <button class="btn btn-outline" (click)="resetUpload()">
                Upload Another Document
              </button>
            </div>
          </div>
        </div>

        <!-- Right Side: Best Practices & Tips Card -->
        <div class="portal-card info-card">
          <div class="info-card-header">
            <div class="spark-icon">✨</div>
            <h3>How RAG Processing Works</h3>
          </div>
          <div class="step-list">
            <div class="step-item">
              <div class="step-number">1</div>
              <div class="step-content">
                <strong>Text Extraction &amp; OCR</strong>
                <p>Apache PDFBox extracts raw text streams and document structural page bounds.</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">2</div>
              <div class="step-content">
                <strong>Semantic Chunking</strong>
                <p>Text is split into 600-character overlapping chunks while retaining exact page metadata.</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">3</div>
              <div class="step-content">
                <strong>Vector Relevance Ranking</strong>
                <p>When you ask a question, our RAG engine identifies the top matching chunks.</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">4</div>
              <div class="step-content">
                <strong>Cited AI Answers</strong>
                <p>The system generates answers with clickable [Page X] citations referencing the original text.</p>
              </div>
            </div>
          </div>

          <div class="usecase-box">
            <h4>💡 Recommended Documents to Test:</h4>
            <ul>
              <li>KYC / Identity Verification Reports &amp; Forms</li>
              <li>Financial Invoices, Purchase Orders &amp; Balance Sheets</li>
              <li>Employment Contracts, NDAs &amp; Legal Policies</li>
              <li>Product Architecture Specs &amp; Technical Manuals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .upload-container {
      padding: 2.5rem 1.5rem;
    }
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      gap: 1rem;
    }
    .page-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .page-subtitle {
      color: #64748b;
      font-size: 0.95rem;
      margin-top: 0.35rem;
      max-width: 650px;
    }
    .upload-grid {
      display: grid;
      grid-template-columns: 1.35fr 1fr;
      gap: 2rem;
    }
    @media (max-width: 900px) {
      .upload-grid {
        grid-template-columns: 1fr;
      }
    }
    .upload-card {
      padding: 2rem;
    }
    .dropzone {
      border: 2px dashed #cbd5e1;
      border-radius: 14px;
      padding: 3rem 2rem;
      text-align: center;
      background: #f8fafc;
      cursor: pointer;
      transition: all 0.25s ease;
    }
    .dropzone:hover, .dropzone.dragover {
      border-color: #4f46e5;
      background: #eef2ff;
      transform: scale(1.01);
    }
    .dropzone-icon {
      width: 68px;
      height: 68px;
      margin: 0 auto 1.25rem;
      border-radius: 50%;
      background: #e0e7ff;
      color: #4f46e5;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .dropzone h3 {
      font-size: 1.2rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }
    .dropzone-hint {
      color: #64748b;
      font-size: 0.85rem;
      margin-bottom: 1.5rem;
    }
    .btn-select {
      margin: 0 auto;
    }
    .progress-box {
      margin-top: 1.5rem;
      padding: 1.25rem;
      background: #f1f5f9;
      border-radius: 10px;
    }
    .progress-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.65rem;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .file-name {
      color: #0f172a;
    }
    .status-tag {
      color: #4f46e5;
    }
    .progress-bar-bg {
      height: 8px;
      background: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      width: 80%;
      background: linear-gradient(90deg, #4f46e5, #06b6d4);
      border-radius: 9999px;
      animation: pulseBar 1.5s infinite ease-in-out;
    }
    @keyframes pulseBar {
      0% { width: 30%; }
      50% { width: 85%; }
      100% { width: 95%; }
    }
    .alert-error {
      margin-top: 1.5rem;
      background: #fee2e2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 0.85rem 1rem;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.9rem;
    }
    .success-card {
      margin-top: 1.5rem;
      padding: 1.5rem;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
    }
    .success-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }
    .success-icon {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #22c55e;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .success-header h4 {
      color: #15803d;
      font-size: 1.1rem;
      font-weight: 700;
    }
    .success-header p {
      color: #166534;
      font-size: 0.85rem;
    }
    .doc-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
      background: white;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid #dcfce7;
      margin-bottom: 1rem;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    .meta-label {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
    }
    .meta-val {
      font-size: 0.95rem;
      color: #0f172a;
      font-weight: 700;
    }
    .summary-preview {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid #dcfce7;
      margin-bottom: 1.25rem;
    }
    .summary-title {
      font-size: 0.78rem;
      font-weight: 700;
      color: #15803d;
      text-transform: uppercase;
      display: block;
      margin-bottom: 0.35rem;
    }
    .summary-text {
      font-size: 0.85rem;
      color: #334155;
      line-height: 1.5;
    }
    .action-row {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .info-card {
      padding: 2rem;
      background: #ffffff;
    }
    .info-card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .spark-icon {
      font-size: 1.5rem;
    }
    .info-card-header h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
    }
    .step-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .step-item {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }
    .step-number {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #eef2ff;
      color: #4f46e5;
      font-weight: 700;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .step-content strong {
      font-size: 0.92rem;
      color: #1e293b;
      display: block;
    }
    .step-content p {
      font-size: 0.82rem;
      color: #64748b;
      margin-top: 0.2rem;
    }
    .usecase-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 1.25rem;
    }
    .usecase-box h4 {
      font-size: 0.9rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.65rem;
    }
    .usecase-box ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .usecase-box li {
      font-size: 0.82rem;
      color: #475569;
      position: relative;
      padding-left: 1.25rem;
    }
    .usecase-box li::before {
      content: "✔";
      position: absolute;
      left: 0;
      color: #10b981;
      font-weight: bold;
    }
  `]
})
export class DocumentUploadComponent {
  isDragging = false;
  uploading = false;
  selectedFile: File | null = null;
  uploadedDoc: DocumentItem | null = null;
  errorMessage = '';

  constructor(private documentService: DocumentService, private router: Router) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      this.errorMessage = 'Please select a valid PDF file (.pdf)';
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      this.errorMessage = 'File exceeds maximum allowed size of 25 MB';
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';
    this.uploading = true;
    this.uploadedDoc = null;

    this.documentService.uploadDocument(file).subscribe({
      next: (doc) => {
        this.uploading = false;
        this.uploadedDoc = doc;
      },
      error: (err) => {
        this.uploading = false;
        this.errorMessage = err.error?.message || 'Failed to upload and parse PDF. Please verify the document.';
      }
    });
  }

  openChatWithDoc(documentId: number): void {
    this.router.navigate(['/chat', documentId]);
  }

  resetUpload(): void {
    this.selectedFile = null;
    this.uploadedDoc = null;
    this.errorMessage = '';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

