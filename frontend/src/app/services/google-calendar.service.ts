import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoogleCalendarService {
  private baseUrl = 'http://localhost:3000/api/google-calendar';

  constructor(private http: HttpClient) {}

  getAuthUrl(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth-url`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  createEvent(eventData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/create-event`, eventData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  getCalendars(): Observable<any> {
    return this.http.get(`${this.baseUrl}/calendars`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }
}