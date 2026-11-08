import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card animate-fade-in">
        <div class="auth-header">
          <div class="logo-circle">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
          <h2>Create Account</h2>
          <p class="subtitle">Get started with AI-powered document intelligence</p>
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
              placeholder="e.g. shivam_kumar"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="email">Work / Personal Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="email"
              required
              class="form-control"
              placeholder="you@company.com"
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
              placeholder="At least 6 characters"
            />
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading">
            <span *ngIf="!loading">Create Free Account</span>
            <span *ngIf="loading">Creating Account...</span>
          </button>

          <div class="auth-footer">
            Already have an account?
            <a routerLink="/login" class="link-highlight">Sign In</a>
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
      background: linear-gradient(135deg, #06b6d4 0%, #4f46e5 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
      box-shadow: 0 4px 14px rgba(6, 182, 212, 0.35);
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
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.username || !this.email || !this.password) {
      this.errorMessage = 'Please complete all required fields';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.register({
      username: this.username,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Try a different username/email.';
      }
    });
  }
}

