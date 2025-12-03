import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private baseUrl = `${environment.apiUrl}/schedules`;

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
