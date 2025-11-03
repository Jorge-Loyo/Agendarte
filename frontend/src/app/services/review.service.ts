import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  patientName: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { rating: number; count: number }[];
}

export interface AppointmentForReview {
  id: number;
  date: string;
  time: string;
  professional: {
    name: string;
    specialty: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:3000/api/reviews';

  constructor(private http: HttpClient) {}

  createReview(reviewData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, reviewData);
  }

  getProfessionalReviews(professionalId: number, rating?: number): Observable<{
    reviews: Review[];
    stats: ReviewStats;
  }> {
    let url = `${this.apiUrl}/professional/${professionalId}`;
    if (rating) {
      url += `?rating=${rating}`;
    }
    return this.http.get<any>(url);
  }

  getAppointmentsForReview(): Observable<{ appointments: AppointmentForReview[] }> {
    return this.http.get<any>(`${this.apiUrl}/appointments-for-review`);
  }
}