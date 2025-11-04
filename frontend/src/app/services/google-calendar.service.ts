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
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/auth-url`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  createEvent(eventData: any): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.baseUrl}/create-event`, eventData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getCalendars(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/calendars`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getEvents(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/events`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  deleteEvent(eventId: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.delete(`${this.baseUrl}/events/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  logout(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.baseUrl}/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}