import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CalendarService, CalendarDay } from '../../services/calendar.service';
import { ProfessionalService } from '../../services/professional.service';

@Component({
  selector: 'app-professional-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './professional-calendar.component.html',
  styleUrls: ['./professional-calendar.component.css']
})
export class ProfessionalCalendarComponent implements OnInit {
  professionalId!: number;
  professional: any = null;
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth() + 1;
  calendar: CalendarDay[] = [];
  selectedDate: CalendarDay | null = null;
  
  monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  constructor(
    private route: ActivatedRoute,
    private calendarService: CalendarService,
    private professionalService: ProfessionalService
  ) {}

  ngOnInit() {
    this.professionalId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProfessional();
    this.loadCalendar();
  }

  loadProfessional() {
    this.professionalService.getProfessionalById(this.professionalId).subscribe({
      next: (response) => {
        this.professional = response.professional;
      },
      error: (error) => console.error('Error loading professional:', error)
    });
  }

  loadCalendar() {
    this.calendarService.getProfessionalCalendar(
      this.professionalId, 
      this.currentYear, 
      this.currentMonth
    ).subscribe({
      next: (response) => {
        this.calendar = response.calendar;
      },
      error: (error) => console.error('Error loading calendar:', error)
    });
  }

  previousMonth() {
    if (this.currentMonth === 1) {
      this.currentMonth = 12;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.loadCalendar();
  }

  nextMonth() {
    if (this.currentMonth === 12) {
      this.currentMonth = 1;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.loadCalendar();
  }

  selectDate(day: CalendarDay) {
    if (day.hasSchedule) {
      this.selectedDate = day;
    }
  }

  getAvailabilityClass(day: CalendarDay): string {
    if (!day.hasSchedule) return 'no-schedule';
    if (day.availableSlots === 0) return 'fully-booked';
    if (day.availableSlots < day.totalSlots / 2) return 'limited-availability';
    return 'available';
  }
}