import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar-wrapper">
      <div class="nav-container">
        <a routerLink="/dashboard" class="brand">
          <div class="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-title">AI DocPortal</span>
            <span class="brand-subtitle">Smart Document RAG &amp; Q&amp;A</span>
          </div>
        </a>

        <nav class="nav-links" *ngIf="authService.isAuthenticated()">
          <a routerLink="/dashboard" routerLinkActive="active-link" class="nav-item">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            Documents
          </a>
          <a routerLink="/upload" routerLinkActive="active-link" class="nav-item">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload PDF
          </a>
          <a routerLink="/chat" routerLinkActive="active-link" class="nav-item">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            Chat &amp; Q&amp;A
          </a>
        </nav>

        <div class="user-actions" *ngIf="authService.isAuthenticated()">
          <div class="user-badge" *ngIf="authService.currentUser() as user">
            <div class="avatar">{{ user.username.charAt(0).toUpperCase() }}</div>
            <span class="username">{{ user.username }}</span>
          </div>
          <button (click)="authService.logout()" class="btn-logout" title="Sign out">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar-wrapper {
      background: #0f172a;
      border-bottom: 1px solid #1e293b;
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .nav-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0.85rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }
    .brand-icon {
      background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.4);
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-title {
      color: #f8fafc;
      font-weight: 700;
      font-size: 1.15rem;
      letter-spacing: -0.02em;
    }
    .brand-subtitle {
      color: #94a3b8;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #94a3b8;
      text-decoration: none;
      padding: 0.55rem 0.95rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }
    .nav-item:hover {
      color: #f8fafc;
      background: rgba(255, 255, 255, 0.05);
    }
    .active-link {
      color: #ffffff;
      background: rgba(99, 102, 241, 0.25);
      border: 1px solid rgba(99, 102, 241, 0.35);
    }
    .user-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .user-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.06);
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .avatar {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #4f46e5;
      color: white;
      font-size: 0.8rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .username {
      color: #e2e8f0;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .btn-logout {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      background: transparent;
      color: #94a3b8;
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 0.45rem 0.85rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-logout:hover {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.3);
      color: #f87171;
    }
  `]
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}
}

