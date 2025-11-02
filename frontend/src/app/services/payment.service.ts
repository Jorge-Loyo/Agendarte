import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = 'http://localhost:3000/api/payments';

  constructor(private http: HttpClient) {}

  createPayment(appointmentId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, { appointmentId }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  simulatePaymentSuccess(appointmentId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/simulate-success`, { appointmentId }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }
}