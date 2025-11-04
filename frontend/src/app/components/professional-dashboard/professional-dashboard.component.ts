import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { NotificationService } from '../../services/notification.service';
import { StatsService } from '../../services/stats.service';
import { GoogleCalendarService } from '../../services/google-calendar.service';
import { Injector } from '@angular/core';
import { ModernCalendarComponent } from '../modern-calendar/modern-calendar.component';

@Component({
  selector: 'app-professional-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ModernCalendarComponent],
  templateUrl: './professional-dashboard.component.html',
  styleUrls: ['./professional-dashboard.component.css']
})
export class ProfessionalDashboardComponent implements OnInit {
  currentUser: User | null = null;
  currentDate = new Date();
  displayDate = new Date();
  currentView = 'day';
  dateKey = Date.now(); // Para forzar actualización
  
  // Calendar data
  dayTimeSlots: any[] = [];
  weekDays: any[] = [];
  monthDays: any[] = [];
  
  todayAppointments: any[] = [];

  weeklyStats = {
    todayAppointments: 0,
    weeklyConfirmed: 0,
    weeklyTotal: 0,
    weeklyPatients: 0,
    monthlyRevenue: 0
  };

  recentPatients: any[] = [];

  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private statsService: StatsService,
    private injector: Injector
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user?.role === 'professional') {
        this.loadStats();
        this.loadAppointments();
        this.loadRecentPatients();
      }
    });
    
    // Verificar si viene de Google Calendar
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('calendar') === 'connected') {
      this.notificationService.success('Éxito', 'Google Calendar conectado exitosamente');
      // Limpiar URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('calendar') === 'error') {
      this.notificationService.error('Error', 'No se pudo conectar con Google Calendar');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    this.loadAppointments();
  }

  loadStats(): void {
    this.statsService.getProfessionalStats().subscribe({
      next: (response) => {
        this.weeklyStats = response.stats;
      },
      error: (error) => {
        console.error('Error cargando estadísticas:', error);
      }
    });
  }

  loadAppointments(): void {
    this.appointmentService.getProfessionalAppointments().subscribe({
      next: (response) => {
        this.todayAppointments = response.appointments || [];
        
        // Si hay citas, navegar a la fecha de la primera cita
        if (this.todayAppointments.length > 0) {
          const firstAppointmentDate = new Date(this.todayAppointments[0].appointmentDate);
          this.displayDate = firstAppointmentDate;
          this.currentDate = new Date(firstAppointmentDate);
        }
        
        this.generateCalendarData();
      },
      error: (error) => {
        console.error('❌ Error cargando citas:', error);
        this.todayAppointments = [];
        this.generateCalendarData();
      }
    });
  }

  loadRecentPatients(): void {
    this.appointmentService.getRecentPatients().subscribe({
      next: (response) => {
        this.recentPatients = response.patients || [];
      },
      error: (error) => {
        console.error('Error cargando pacientes recientes:', error);
        this.recentPatients = [];
      }
    });
  }

  generateCalendarData() {
    // Force change detection
    this.currentDate = new Date(this.currentDate);
    this.generateDayView();
    this.generateWeekView();
    this.generateMonthView();
  }

  generateDayView() {
    const slots = [];
    const occupiedSlots = new Set();
    const today = this.displayDate.toISOString().split('T')[0];
    
    const todayAppointments = this.todayAppointments.filter(apt => 
      apt.appointmentDate === today
    );
    
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 60) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
        const timeDisplay = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        if (occupiedSlots.has(time)) {
          continue;
        }
        
        const appointment = todayAppointments.find(apt => 
          apt.time === time || apt.time === timeDisplay
        );
        
        if (appointment) {
          slots.push({
            time: timeDisplay,
            isOccupied: true,
            duration: 60,
            appointment: {
              id: appointment.id,
              patientName: appointment.patient || appointment.patientName,
              reason: appointment.reason || appointment.notes || 'Consulta',
              status: appointment.status
            }
          });
        } else {
          slots.push({
            time: timeDisplay,
            isOccupied: false,
            duration: 60,
            appointment: null
          });
        }
      }
    }
    
    this.dayTimeSlots = slots;
  }

  generateWeekView() {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    
    // Obtener el inicio de la semana (lunes)
    const startOfWeek = new Date(this.displayDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    this.weekDays = days.map((name, index) => {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + index);
      const dayString = currentDay.toISOString().split('T')[0];
      
      // Filtrar citas solo para este día específico
      const dayAppointments = this.todayAppointments.filter(apt => 
        apt.appointmentDate === dayString
      );
      
      return {
        name: `${name} ${currentDay.getDate()}`,
        date: currentDay,
        timeSlots: this.generateTimeSlotsForDay(dayAppointments),
        appointments: dayAppointments.map(apt => ({
          id: apt.id,
          time: apt.time,
          patientName: apt.patient || apt.patientName,
          status: apt.status,
          reason: apt.reason || apt.notes
        }))
      };
    });
  }

  generateTimeSlotsForDay(dayAppointments: any[]) {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      const appointment = dayAppointments.find(apt => 
        apt.time === `${time}:00` || apt.time === time
      );
      
      slots.push({
        time,
        appointment: appointment ? {
          patientName: appointment.patient || appointment.patientName,
          status: appointment.status
        } : null
      });
    }
    return slots;
  }

  generateMonthView() {
    const currentMonth = this.displayDate.getMonth();
    const currentYear = this.displayDate.getFullYear();
    const today = new Date();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayAppointments = this.todayAppointments.filter(apt => 
        apt.appointmentDate === dateString
      );
      
      days.push({
        number: date.getDate(),
        isCurrentMonth: date.getMonth() === currentMonth,
        isToday: date.toDateString() === today.toDateString(),
        appointments: dayAppointments.map(apt => ({ 
          status: apt.status,
          time: apt.time,
          patient: apt.patient || apt.patientName
        }))
      });
    }
    
    this.monthDays = days;
  }

  goToToday() {
    this.displayDate = new Date();
    this.currentDate = new Date();
    this.generateCalendarData();
  }

  previousPeriod() {
    if (this.currentView === 'day') {
      this.displayDate = new Date(this.displayDate.getTime() - 24 * 60 * 60 * 1000);
    } else if (this.currentView === 'week') {
      this.displayDate = new Date(this.displayDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      this.displayDate = new Date(this.displayDate.getFullYear(), this.displayDate.getMonth() - 1, this.displayDate.getDate());
    }
    this.currentDate = new Date(this.displayDate);
    this.dateKey = Date.now();
    this.generateCalendarData();
  }

  nextPeriod() {
    if (this.currentView === 'day') {
      this.displayDate = new Date(this.displayDate.getTime() + 24 * 60 * 60 * 1000);
    } else if (this.currentView === 'week') {
      this.displayDate = new Date(this.displayDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else {
      this.displayDate = new Date(this.displayDate.getFullYear(), this.displayDate.getMonth() + 1, this.displayDate.getDate());
    }
    this.currentDate = new Date(this.displayDate);
    this.dateKey = Date.now();
    this.generateCalendarData();
  }

  viewAppointmentDetails(appointment: any) {
    this.notificationService.info('Detalles', `Paciente: ${appointment.patientName}`);
  }

  addNotes(appointment: any) {
    this.router.navigate(['/app/appointment-notes', appointment.id]);
  }

  scheduleAppointment(time: string) {
    this.notificationService.info('Agendar', `Nuevo turno a las ${time}`);
  }

  openScheduleModal() {
    this.router.navigate(['/app/professional-appointment']);
  }

  connectGoogleCalendar() {
    const googleCalendarService = this.injector.get(GoogleCalendarService);
    googleCalendarService.getAuthUrl().subscribe({
      next: (response: any) => {
        // Abrir en la misma ventana para evitar problemas de popup
        window.location.href = response.authUrl;
      },
      error: (error: any) => {
        this.notificationService.error('Error', 'No se pudo conectar con Google Calendar');
      }
    });
  }

  getFormattedDate(): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    };
    return this.displayDate.toLocaleDateString('es-ES', options);
  }

  getFormattedMonth(): string {
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      year: 'numeric'
    };
    return this.displayDate.toLocaleDateString('es-ES', options);
  }

  getWeekRange(): string {
    const startOfWeek = new Date(this.displayDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Lunes como primer día
    startOfWeek.setDate(diff);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    const endOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    
    return `${startOfWeek.toLocaleDateString('es-ES', startOptions)} - ${endOfWeek.toLocaleDateString('es-ES', endOptions)}`;
  }

  getAppointmentStatusClass(status: string): string {
    switch(status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  getPatientStatusClass(status: string): string {
    switch(status) {
      case 'Estable': return 'patient-stable';
      case 'En tratamiento': return 'patient-treatment';
      case 'Saludable': return 'patient-healthy';
      default: return '';
    }
  }

  viewPatientHistory(patientId: number): void {
    this.router.navigate(['/app/patient-history', patientId]);
  }

  cancelAppointment(appointment: any): void {
    const reason = prompt('Motivo de cancelación (opcional):');
    if (reason !== null) {
      this.appointmentService.cancelProfessionalAppointment(appointment.id, reason).subscribe({
        next: () => {
          this.notificationService.success('Éxito', 'Turno cancelado exitosamente');
          this.generateCalendarData();
        },
        error: (error) => {
          this.notificationService.error('Error', 'No se pudo cancelar el turno');
        }
      });
    }
  }

  rescheduleAppointment(appointment: any): void {
    const newDate = prompt('Nueva fecha (YYYY-MM-DD):');
    if (newDate) {
      const newTime = prompt('Nueva hora (HH:MM):');
      if (newTime) {
        const reason = prompt('Motivo de reprogramación (opcional):');
        this.appointmentService.rescheduleProfessionalAppointment(appointment.id, newDate, newTime, reason || '').subscribe({
          next: () => {
            this.notificationService.success('Éxito', 'Turno reprogramado exitosamente');
            this.generateCalendarData();
          },
          error: (error) => {
            this.notificationService.error('Error', 'No se pudo reprogramar el turno');
          }
        });
      }
    }
  }
}