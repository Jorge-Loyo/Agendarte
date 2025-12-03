import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private baseUrl = `${environment.apiUrl}/stats`;

  constructor(private http: HttpClient) {}

  getProfessionalStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/professional`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }
}
