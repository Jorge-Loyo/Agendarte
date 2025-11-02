import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private baseUrl = 'http://localhost:3000/api/appointments';

  constructor(private http: HttpClient) {}

  getMyAppointments(): Observable<any> {
    return this.http.get(`${this.baseUrl}/my-appointments`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }
}