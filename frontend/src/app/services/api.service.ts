import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;
  

  constructor(private http: HttpClient) {}

  getHomeData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/home`);
  }
  
}

