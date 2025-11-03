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
    // Verificar si hay token guardado
    const token = localStorage.getItem('token');
    if (token) {
      this.getProfile().subscribe({
        error: () => {
          // Si el token es inválido, limpiar
          this.logout();
        }
      });
    }
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, userData)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/profile`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).pipe(
      tap((response: any) => {
        this.currentUserSubject.next(response.user);
      })
    );
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const user = this.getCurrentUser();
    return !!(token && user);
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
    return this.http.put(`${this.baseUrl}/profile`, userData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).pipe(
      tap((response: any) => {
        // Recargar perfil después de actualizar
        this.getProfile().subscribe();
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/change-password`, 
      { currentPassword, newPassword }, 
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }
    );
  }
}