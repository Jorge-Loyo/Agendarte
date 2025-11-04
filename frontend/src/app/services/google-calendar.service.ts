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
    return this.http.get(`${this.baseUrl}/auth-url`);
  }

  createEvent(eventData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/create-event`, eventData);
  }

  getCalendars(): Observable<any> {
    return this.http.get(`${this.baseUrl}/calendars`);
  }
}