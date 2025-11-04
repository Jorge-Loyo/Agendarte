import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoogleMeetService {
  private baseUrl = 'http://localhost:3000/api/google-meet';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  createMeeting(meetingData: {
    title: string;
    startTime: string;
    endTime: string;
    description?: string;
    attendees?: string[];
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, meetingData, {
      headers: this.getHeaders()
    });
  }

  getMeetings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/meetings`, {
      headers: this.getHeaders()
    });
  }

  deleteMeeting(meetingId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/meetings/${meetingId}`, {
      headers: this.getHeaders()
    });
  }
}