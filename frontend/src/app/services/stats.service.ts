import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private baseUrl = 'http://localhost:3000/api/stats';

  constructor(private http: HttpClient) {}

  getProfessionalStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/professional`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }
}