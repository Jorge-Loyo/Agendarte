import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientHistoryService {
  private baseUrl = 'http://localhost:3000/api/patient-history';

  constructor(private http: HttpClient) {}

  getPatientHistory(patientId: number, filters?: any): Observable<any> {
    let params = '';
    if (filters) {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      params = queryParams.toString() ? `?${queryParams.toString()}` : '';
    }

    return this.http.get(`${this.baseUrl}/${patientId}${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }
}