import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CalendarDay {
  date: string;
  dayOfWeek: number;
  hasSchedule: boolean;
  availableSlots: number;
  totalSlots: number;
  appointments: number;
  slots: TimeSlot[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private baseUrl = 'http://localhost:3000/api/calendar';

  constructor(private http: HttpClient) {}

  getProfessionalCalendar(professionalId: number, year: number, month: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/professional/${professionalId}?year=${year}&month=${month}`);
  }
}