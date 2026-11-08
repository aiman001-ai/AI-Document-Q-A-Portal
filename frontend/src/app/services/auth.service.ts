import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';
  private tokenKey = 'aidoc_jwt_token';
  private userKey = 'aidoc_user';

  currentUser = signal<User | null>(this.getStoredUser());

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.saveAuth(response);
      })
    );
  }

  register(data: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => {
        this.saveAuth(response);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private saveAuth(res: AuthResponse): void {
    localStorage.setItem(this.tokenKey, res.token);
    const user: User = {
      id: res.id,
      username: res.username,
      email: res.email,
      role: res.role
    };
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}

