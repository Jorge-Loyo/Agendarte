import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { GoogleCalendarService } from '../../services/google-calendar.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  currentUser: User | null = null;
  currentMonth = '';
  currentYear = 0;
  weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  calendarDays: any[] = [];
  upcomingAppointments: any[] = [];
  private currentDate = new Date();

  constructor(
    private authService: AuthService,
    private router: Router,
    private googleCalendar: GoogleCalendarService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/login']);
      }
    });
    
    this.generateCalendar();
    this.loadUpcomingAppointments();
    this.initializeGoogleCalendar();
  }

  async initializeGoogleCalendar() {
    try {
      await this.googleCalendar.initializeGapi();
    } catch (error) {
      console.error('Error inicializando Google Calendar:', error);
    }
  }

  async connectGoogleCalendar() {
    try {
      const success = await this.googleCalendar.signIn();
      if (success) {
        console.log('Conectado a Google Calendar');
        this.syncWithGoogleCalendar();
      }
    } catch (error) {
      console.error('Error conectando con Google Calendar:', error);
    }
  }

  async syncWithGoogleCalendar() {
    try {
      const events = await this.googleCalendar.getEvents();
      console.log('Eventos de Google Calendar:', events);
    } catch (error) {
      console.error('Error sincronizando eventos:', error);
    }
  }

  isGoogleConnected(): boolean {
    return this.googleCalendar.isUserSignedIn();
  }

  generateCalendar() {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    this.currentMonth = months[this.currentDate.getMonth()];
    this.currentYear = this.currentDate.getFullYear();
    
    const firstDay = new Date(this.currentYear, this.currentDate.getMonth(), 1);
    const lastDay = new Date(this.currentYear, this.currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    this.calendarDays = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      this.calendarDays.push({
        number: date.getDate(),
        isCurrentMonth: date.getMonth() === this.currentDate.getMonth(),
        isToday: date.toDateString() === today.toDateString(),
        hasAppointment: Math.random() > 0.8, // Simulado
        appointments: Math.random() > 0.9 ? [{ id: 1 }, { id: 2 }] : []
      });
    }
  }

  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }

  loadUpcomingAppointments() {
    // Datos simulados
    this.upcomingAppointments = [
      {
        date: '15 Nov',
        time: '10:30',
        professional: 'Dr. García',
        specialty: 'Cardiología',
        status: 'confirmed'
      },
      {
        date: '18 Nov',
        time: '14:00',
        professional: 'Dra. López',
        specialty: 'Dermatología',
        status: 'pending'
      }
    ];
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
