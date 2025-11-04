import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { ProfessionalService } from '../../services/professional.service';

@Component({
  selector: 'app-professional-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './professional-appointment.component.html',
  styleUrls: ['./professional-appointment.component.css']
})
export class ProfessionalAppointmentComponent implements OnInit {
  step = 1;
  searchTerm = '';
  patients: any[] = [];
  selectedPatient: any = null;
  selectedDate = '';
  selectedTime = '';
  notes = '';
  loading = false;
  currentUser: any = null;

  availableTimes: string[] = [];
  consultationDuration = 60; // Por defecto 60 minutos

  constructor(
    private router: Router,
    private appointmentService: AppointmentService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private professionalService: ProfessionalService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadMyPatients();
    this.loadScheduleConfig();
  }
  
  loadMyPatients() {
    this.loading = true;
    this.professionalService.getMyPatients().subscribe({
      next: (response: any) => {
        this.patients = Array.isArray(response) ? response : response.patients || [];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading patients:', error);
        this.patients = [];
        this.loading = false;
      }
    });
  }

  get filteredPatients() {
    if (!this.searchTerm) return this.patients;
    return this.patients.filter(patient =>
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      patient.dni?.includes(this.searchTerm)
    );
  }

  selectPatient(patient: any) {
    this.selectedPatient = patient;
    this.step = 2;
    this.loadAvailableTimes();
  }

  loadScheduleConfig() {
    // Por ahora usar configuración por defecto, después se puede cargar del backend
    this.consultationDuration = 60;
    this.generateAvailableTimes();
  }

  generateAvailableTimes() {
    const times = [];
    
    // Horario mañana: 9:00 - 12:00
    let currentTime = this.parseTime('09:00');
    const morningEnd = this.parseTime('12:00');
    
    while (currentTime < morningEnd) {
      times.push(this.formatTime(currentTime));
      currentTime += this.consultationDuration * 60000; // Convertir minutos a ms
    }
    
    // Horario tarde: 14:00 - 18:00
    currentTime = this.parseTime('14:00');
    const afternoonEnd = this.parseTime('18:00');
    
    while (currentTime < afternoonEnd) {
      times.push(this.formatTime(currentTime));
      currentTime += this.consultationDuration * 60000;
    }
    
    this.availableTimes = times;
  }

  parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 3600000 + minutes * 60000;
  }

  formatTime(ms: number): string {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  loadAvailableTimes() {
    if (this.selectedDate) {
      // Los horarios ya están generados según la duración
      // Aquí se podría filtrar por horarios ocupados
    }
  }

  onDateChange() {
    this.selectedTime = '';
    this.loadAvailableTimes();
  }

  selectDateTime() {
    if (this.selectedDate && this.selectedTime) {
      this.step = 3;
    }
  }

  confirmAppointment() {
    const appointmentData = {
      patientId: this.selectedPatient.id,
      date: this.selectedDate,
      time: this.selectedTime,
      notes: this.notes,
      createdByProfessional: true
    };

    this.loading = true;
    this.appointmentService.createProfessionalAppointment(appointmentData).subscribe({
      next: (response) => {
        this.notificationService.success(
          'Turno agendado',
          `Turno agendado para ${this.selectedPatient.firstName} ${this.selectedPatient.lastName}`
        );
        this.router.navigate(['/app/professional-dashboard']);
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.error(
          'Error',
          error.error?.message || 'Error al agendar el turno'
        );
      }
    });
  }

  goBack() {
    if (this.step > 1) {
      this.step--;
    } else {
      this.router.navigate(['/app/professional-dashboard']);
    }
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
}