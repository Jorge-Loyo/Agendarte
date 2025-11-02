import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Specialty {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SpecialtyService {
  private apiUrl = 'http://localhost:3000/api/specialties';

  constructor(private http: HttpClient) { }

  getSpecialties(): Observable<Specialty[]> {
    return this.http.get<Specialty[]>(this.apiUrl);
  }

  createSpecialty(specialty: Partial<Specialty>): Observable<Specialty> {
    return this.http.post<Specialty>(this.apiUrl, specialty);
  }

  updateSpecialty(id: number, specialty: Partial<Specialty>): Observable<Specialty> {
    return this.http.put<Specialty>(`${this.apiUrl}/${id}`, specialty);
  }

  deleteSpecialty(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}