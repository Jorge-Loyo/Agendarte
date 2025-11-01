import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';
  

  constructor(private http: HttpClient) {}

  getHomeData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/home`);
  }
  
}

