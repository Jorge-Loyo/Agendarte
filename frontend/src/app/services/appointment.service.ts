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

  createAppointment(appointmentData: any): Observable<any> {
    return this.http.post(this.baseUrl, appointmentData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  createProfessionalAppointment(appointmentData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/professional`, appointmentData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  cancelAppointment(appointmentId: number, reason?: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${appointmentId}/cancel`, { reason }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  rescheduleAppointment(appointmentId: number, newDate: string, newTime: string, reason?: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${appointmentId}/reschedule`, { newDate, newTime, reason }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  cancelProfessionalAppointment(appointmentId: number, reason?: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${appointmentId}/professional-cancel`, { reason }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  rescheduleProfessionalAppointment(appointmentId: number, newDate: string, newTime: string, reason?: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${appointmentId}/professional-reschedule`, { newDate, newTime, reason }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  getProfessionalAppointments(): Observable<any> {
    return this.http.get(`${this.baseUrl}/professional-appointments`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  getRecentPatients(): Observable<any> {
    return this.http.get(`${this.baseUrl}/recent-patients`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }
}