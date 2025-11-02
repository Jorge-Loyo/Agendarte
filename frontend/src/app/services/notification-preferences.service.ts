import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationPreferencesService {
  private baseUrl = 'http://localhost:3000/api/notifications';

  constructor(private http: HttpClient) {}

  getPreferences(): Observable<any> {
    return this.http.get(`${this.baseUrl}/preferences`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  updatePreferences(preferences: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/preferences`, preferences, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }
}