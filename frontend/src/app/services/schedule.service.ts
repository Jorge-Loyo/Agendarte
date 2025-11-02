import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private baseUrl = 'http://localhost:3000/api/schedules';

  constructor(private http: HttpClient) {}

  getMySchedules(): Observable<any> {
    return this.http.get(`${this.baseUrl}/my-schedules`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  updateMySchedules(schedules: any[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/my-schedules`, { schedules }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }
}