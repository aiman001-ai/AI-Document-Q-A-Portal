import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card animate-fade-in">
        <div class="auth-header">
          <div class="logo-circle">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <h2>Welcome to AI DocPortal</h2>
          <p class="subtitle">Sign in to search, query and chat with your documents</p>
        </div>

        <div class="alert alert-error" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              [(ngModel)]="username"
              required
              class="form-control"
              placeholder="e.g. dev_analyst"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="password"
              required
              class="form-control"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading">
            <span *ngIf="!loading">Sign In to Workspace</span>
            <span *ngIf="loading">Authenticating...</span>
          </button>

          <div class="test-account-hint">
            <span class="hint-label">Default account:</span>
            <button type="button" (click)="fillDemoCredentials()" class="btn-demo">
              demo_user / password123
            </button>
          </div>

          <div class="auth-footer">
            Don't have an account?
            <a routerLink="/register" class="link-highlight">Create Account</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 70px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      background: radial-gradient(circle at 50% 20%, #eef2ff 0%, #f8fafc 100%);
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 2.5rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .logo-circle {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
    }
    h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
    }
    .subtitle {
      font-size: 0.9rem;
      color: #64748b;
    }
    .alert {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1.25rem;
      font-size: 0.85rem;
      font-weight: 500;
    }
    .alert-error {
      background-color: #fee2e2;
      border: 1px solid #fecaca;
      color: #dc2626;
    }
    .btn-block {
      width: 100%;
      padding: 0.8rem;
      font-size: 0.95rem;
      margin-top: 0.5rem;
    }
    .test-account-hint {
      margin-top: 1.25rem;
      padding: 0.75rem 1rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .hint-label {
      font-size: 0.8rem;
      color: #64748b;
      font-weight: 500;
    }
    .btn-demo {
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      color: #4338ca;
      font-size: 0.82rem;
      font-weight: 600;
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-demo:hover {
      background: #e0e7ff;
    }
    .auth-footer {
      text-align: center;
      margin-top: 1.75rem;
      font-size: 0.875rem;
      color: #64748b;
    }
    .link-highlight {
      color: #4f46e5;
      font-weight: 600;
      text-decoration: none;
      margin-left: 0.35rem;
    }
    .link-highlight:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) { }

  fillDemoCredentials(): void {
    this.username = 'demo_user';
    this.password = 'password123';
  }

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please provide both username and password';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        // If user does not exist yet in fresh H2 database, automatically try to register demo account!
        if (this.username === 'demo_user' || this.username === 'admin') {
          this.authService.register({
            username: this.username,
            email: `${this.username}@example.com`,
            password: this.password
          }).subscribe({
            next: () => {
              this.router.navigate(['/dashboard']);
            },
            error: () => {
              this.errorMessage = err.error?.message || 'Invalid username or password';
            }
          });
        } else {
          this.errorMessage = err.error?.message || 'Invalid username or password';
        }
      }
    });
  }
}

