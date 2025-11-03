import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private baseUrl = 'http://localhost:3000/api/notes';

  constructor(private http: HttpClient) {}

  getAppointmentNotes(appointmentId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${appointmentId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  updateAppointmentNotes(appointmentId: number, notes: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${appointmentId}`, { notes }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }
}