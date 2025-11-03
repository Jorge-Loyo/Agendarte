import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'http://localhost:3000/api/admin';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<any> {
    const token = localStorage.getItem('token');
    console.log('Token:', token ? 'Existe' : 'No existe');
    console.log('URL:', `${this.baseUrl}/users`);
    
    return this.http.get(`${this.baseUrl}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users`, userData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  updateUserRole(userId: number, roleData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${userId}`, roleData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  updateUser(userId: number, userData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${userId}/full`, userData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  // Gestión de turnos
  getAllAppointments(): Observable<any> {
    return this.http.get(`${this.baseUrl}/appointments`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  createAppointment(appointmentData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/appointments`, appointmentData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  cancelAppointment(appointmentId: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/appointments/${appointmentId}/cancel`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  rescheduleAppointment(appointmentId: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/appointments/${appointmentId}/reschedule`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  processPayment(appointmentId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/appointments/${appointmentId}/payment`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  searchPatients(query: string): Observable<any> {
    return this.http.get(`http://localhost:3000/api/patients/search?q=${query}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  // Gestión de pacientes
  getPatients(): Observable<any> {
    return this.http.get(`${this.baseUrl}/patients`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  createPatient(patientData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/patients`, patientData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  // Reportes
  generateReport(filters: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/reports`, filters, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  // Gestión de permisos
  resetUserPassword(userId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/${userId}/reset-password`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  getUsers(): Observable<any> {
    return this.getAllUsers();
  }

  getSpecialties(): Observable<any> {
    return this.http.get(`http://localhost:3000/api/specialties`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  createSpecialty(specialtyData: any): Observable<any> {
    return this.http.post(`http://localhost:3000/api/specialties`, specialtyData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  deleteSpecialty(specialtyId: number): Observable<any> {
    return this.http.delete(`http://localhost:3000/api/specialties/${specialtyId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  deletePatient(patientId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/patients/${patientId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }
}