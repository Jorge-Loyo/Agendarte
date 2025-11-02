import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { GoogleCalendarService } from '../../services/google-calendar.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  currentUser: User | null = null;
  selectedDate: Date | null = new Date();
  upcomingAppointments: any[] = [];

  
  // Variables del calendario
  currentMonth = '';
  currentYear = 0;
  weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  calendarDays: any[] = [];
  private currentDate = new Date();
  
  // Simulación de citas por fecha
  appointmentsByDate = new Map<string, Array<{id: number; title: string; type: 'medical' | 'personal' | 'reminder'}>>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private googleCalendar: GoogleCalendarService
  ) {}

  ngOnInit() {
    // Simulamos un usuario para testing
    this.currentUser = {
      id: 1,
      email: 'test@test.com',
      role: 'patient',
      profile: { firstName: 'Usuario' }
    };
    
    this.generateCalendar();
    this.loadUpcomingAppointments();
    this.generateMockAppointments();
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

  generateMockAppointments() {
    const today = new Date();
    
    // Generar citas de ejemplo para los próximos 30 días
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      if (date.getDay() >= 1 && date.getDay() <= 5 && Math.random() > 0.8) {
        const dateKey = this.getDateKey(date);
        const appointments = [];
        
        if (Math.random() > 0.7) {
          appointments.push({
            id: Math.random(),
            title: 'Consulta médica',
            type: 'medical' as const
          });
        }
        
        if (Math.random() > 0.9) {
          appointments.push({
            id: Math.random(),
            title: 'Recordatorio',
            type: 'reminder' as const
          });
        }
        
        if (appointments.length > 0) {
          this.appointmentsByDate.set(dateKey, appointments);
        }
      }
    }
  }
  
  private getDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  generateCalendar() {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    this.currentMonth = months[this.currentDate.getMonth()];
    this.currentYear = this.currentDate.getFullYear();
    
    const firstDay = new Date(this.currentYear, this.currentDate.getMonth(), 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    this.calendarDays = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateKey = this.getDateKey(date);
      const appointments = this.appointmentsByDate.get(dateKey) || [];
      
      this.calendarDays.push({
        number: date.getDate(),
        date: new Date(date),
        isCurrentMonth: date.getMonth() === this.currentDate.getMonth(),
        isToday: date.toDateString() === today.toDateString(),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        hasAppointment: appointments.length > 0,
        appointments
      });
    }
  }

  previousMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  onDateSelected(day: any) {
    if (day.isCurrentMonth) {
      this.selectedDate = day.date;
    }
  }
  
  getAppointmentsForSelectedDate() {
    if (!this.selectedDate) return [];
    const dateKey = this.getDateKey(this.selectedDate);
    return this.appointmentsByDate.get(dateKey) || [];
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

  goToToday() {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.generateCalendar();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}