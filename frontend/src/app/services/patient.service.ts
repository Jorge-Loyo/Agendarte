import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private baseUrl = 'http://localhost:3000/api/patients';

  constructor(private http: HttpClient) {}

  searchPatients(query: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/search?q=${query}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }
}