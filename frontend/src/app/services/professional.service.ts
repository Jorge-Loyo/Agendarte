import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Professional {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  rating: number;
  totalReviews: number;
  consultationPrice: number;
  licenseNumber: string;
  email: string;
  phone: string;
  address: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfessionalService {
  private baseUrl = 'http://localhost:3000/api/professionals';

  constructor(private http: HttpClient) {}

  getAllProfessionals(filters?: { specialty?: string; rating?: number }): Observable<any> {
    let params = '';
    if (filters) {
      const queryParams = new URLSearchParams();
      if (filters.specialty) queryParams.append('specialty', filters.specialty);
      if (filters.rating) queryParams.append('rating', filters.rating.toString());
      params = queryParams.toString() ? `?${queryParams.toString()}` : '';
    }
    
    return this.http.get(`${this.baseUrl}${params}`);
  }

  getProfessionalById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  getMyPatients(): Observable<any> {
    return this.http.get(`${this.baseUrl}/my-patients`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  getAvailablePatients(): Observable<any> {
    return this.http.get(`http://localhost:3000/api/patients`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  addPatientToCartilla(patientId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/add-patient`, { patientId }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  removePatientFromCartilla(patientId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/remove-patient/${patientId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  createPatient(patientData: any): Observable<any> {
    return this.http.post(`http://localhost:3000/api/admin/patients`, patientData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }
}