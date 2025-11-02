import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { GoogleCalendarService } from '../../services/google-calendar.service';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
    private googleCalendar: GoogleCalendarService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.generateCalendar();
    this.loadUpcomingAppointments();
  }

  ionViewWillEnter() {
    // Recargar datos cuando se vuelve a la página
    this.loadUpcomingAppointments();
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
    this.appointmentService.getMyAppointments().subscribe({
      next: (response) => {
        this.upcomingAppointments = response.appointments.map((apt: any) => ({
          date: new Date(apt.appointmentDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
          time: apt.appointmentTime,
          professional: apt.professional?.user?.profile?.firstName + ' ' + apt.professional?.user?.profile?.lastName || 'Profesional',
          specialty: apt.professional?.specialty || 'Consulta',
          status: apt.status
        }));
        this.updateCalendarWithAppointments();
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
      }
    });
  }

  updateCalendarWithAppointments() {
    // Limpiar citas anteriores
    this.appointmentsByDate.clear();
    
    // Agregar citas reales al calendario usando appointmentDate directamente
    this.appointmentService.getMyAppointments().subscribe({
      next: (response) => {
        response.appointments.forEach((apt: any) => {
          const dateKey = apt.appointmentDate; // Ya viene en formato YYYY-MM-DD
          const existing = this.appointmentsByDate.get(dateKey) || [];
          existing.push({
            id: apt.id,
            title: 'Cita médica',
            type: 'medical' as const
          });
          this.appointmentsByDate.set(dateKey, existing);
        });
        this.generateCalendar();
      }
    });
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