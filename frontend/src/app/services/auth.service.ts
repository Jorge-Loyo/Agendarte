import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: number;
  email: string;
  role: string;
  profile?: any;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/api/auth';
  private profileUrl = 'http://localhost:3000/api/profile';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getStoredToken();
    const userData = this.getStoredUser();
    
    if (token && userData) {
      // Restaurar usuario desde cache
      this.currentUserSubject.next(userData);
      
      // Verificar token válido
      this.getProfile().subscribe({
        next: (response: any) => {
          this.storeUser(response.user);
        },
        error: () => {
          this.clearAuth();
        }
      });
    }
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  private getStoredUser(): User | null {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  private storeAuth(token: string, user: User, remember: boolean = true): void {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('token', token);
    storage.setItem('user', JSON.stringify(user));
    storage.setItem('authTime', Date.now().toString());
  }

  private storeUser(user: User): void {
    const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(user));
  }

  private clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authTime');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('authTime');
    this.currentUserSubject.next(null);
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, userData)
      .pipe(
        tap(response => {
          this.storeAuth(response.token, response.user, true);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  login(email: string, password: string, remember: boolean = true): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          this.storeAuth(response.token, response.user, remember);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    this.clearAuth();
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/profile`).pipe(
      tap((response: any) => {
        this.storeUser(response.user);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const user = this.getCurrentUser();
    const authTime = localStorage.getItem('authTime') || sessionStorage.getItem('authTime');
    
    if (!token || !user || !authTime) return false;
    
    // Verificar si el token no ha expirado (24 horas)
    const tokenAge = Date.now() - parseInt(authTime);
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    
    if (tokenAge > maxAge) {
      this.clearAuth();
      return false;
    }
    
    return true;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  isAdmin(): boolean {
    return this.hasAnyRole(['admin', 'master']);
  }

  updateProfile(userData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/profile`, userData).pipe(
      tap((response: any) => {
        this.getProfile().subscribe();
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/change-password`, 
      { currentPassword, newPassword }
    );
  }

  getToken(): string | null {
    return this.getStoredToken();
  }
}