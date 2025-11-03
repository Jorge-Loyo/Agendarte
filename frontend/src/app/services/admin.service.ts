import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'http://localhost:3000/api/admin';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users`, userData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  updateUserRole(userId: number, roleData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${userId}`, roleData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }
}