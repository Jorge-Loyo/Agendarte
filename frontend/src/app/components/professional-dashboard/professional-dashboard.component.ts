import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { NotificationService } from '../../services/notification.service';
import { StatsService } from '../../services/stats.service';

@Component({
  selector: 'app-professional-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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
  
  todayAppointments = [
    { id: 1, time: '09:00', patient: 'María García', patientName: 'María García', reason: 'Control rutinario', status: 'confirmed', duration: 30 },
    { id: 2, time: '10:30', patient: 'Juan Pérez', patientName: 'Juan Pérez', reason: 'Consulta inicial', status: 'confirmed', duration: 60 },
    { id: 3, time: '14:00', patient: 'Ana López', patientName: 'Ana López', reason: 'Seguimiento', status: 'pending', duration: 30 },
    { id: 4, time: '15:30', patient: 'Carlos Ruiz', patientName: 'Carlos Ruiz', reason: 'Control post-operatorio', status: 'confirmed', duration: 30 }
  ];

  weeklyStats = {
    todayAppointments: 0,
    weeklyConfirmed: 0,
    weeklyTotal: 0,
    weeklyPatients: 0,
    monthlyRevenue: 0
  };

  recentPatients = [
    { id: 3, name: 'Ana García', lastVisit: '2024-11-01', condition: 'Hipertensión', status: 'Estable' },
    { id: 4, name: 'Prueba Perez', lastVisit: '2024-10-28', condition: 'Diabetes tipo 2', status: 'En tratamiento' },
    { id: 5, name: 'Usuario Prueba', lastVisit: '2024-10-25', condition: 'Control rutinario', status: 'Saludable' }
  ];

  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private statsService: StatsService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user?.role === 'professional') {
        this.loadStats();
      }
    });
    this.generateCalendarData();
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
    
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        if (occupiedSlots.has(time)) {
          continue; // Skip if already occupied by longer appointment
        }
        
        const appointment = this.todayAppointments.find(apt => apt.time === time);
        
        if (appointment) {
          // Mark additional slots as occupied for 60-minute appointments
          if (appointment.duration === 60) {
            const nextSlot = `${hour.toString().padStart(2, '0')}:${(minute + 30).toString().padStart(2, '0')}`;
            occupiedSlots.add(nextSlot);
          }
          
          slots.push({
            time,
            isOccupied: true,
            duration: appointment.duration || 30,
            appointment: {
              patientName: appointment.patient,
              reason: appointment.reason,
              status: appointment.status
            }
          });
        } else {
          slots.push({
            time,
            isOccupied: false,
            duration: 30,
            appointment: null
          });
        }
      }
    }
    this.dayTimeSlots = slots;
  }

  generateWeekView() {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    this.weekDays = days.map(name => ({
      name,
      appointments: this.todayAppointments.map(apt => ({
        time: apt.time,
        patientName: apt.patient,
        status: apt.status
      }))
    }));
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
      
      days.push({
        number: date.getDate(),
        isCurrentMonth: date.getMonth() === currentMonth,
        isToday: date.toDateString() === today.toDateString(),
        appointments: date.toDateString() === today.toDateString() ? 
          this.todayAppointments.map(apt => ({ status: apt.status })) : []
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
    console.log('Previous - Antes:', this.displayDate.toDateString());
    if (this.currentView === 'day') {
      this.displayDate = new Date(this.displayDate.getTime() - 24 * 60 * 60 * 1000);
    } else if (this.currentView === 'week') {
      this.displayDate = new Date(this.displayDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      this.displayDate = new Date(this.displayDate.getFullYear(), this.displayDate.getMonth() - 1, this.displayDate.getDate());
    }
    console.log('Previous - Después:', this.displayDate.toDateString());
    this.currentDate = new Date(this.displayDate);
    this.dateKey = Date.now();
    this.generateCalendarData();
  }

  nextPeriod() {
    console.log('Next - Antes:', this.displayDate.toDateString());
    if (this.currentView === 'day') {
      this.displayDate = new Date(this.displayDate.getTime() + 24 * 60 * 60 * 1000);
    } else if (this.currentView === 'week') {
      this.displayDate = new Date(this.displayDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else {
      this.displayDate = new Date(this.displayDate.getFullYear(), this.displayDate.getMonth() + 1, this.displayDate.getDate());
    }
    console.log('Next - Después:', this.displayDate.toDateString());
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