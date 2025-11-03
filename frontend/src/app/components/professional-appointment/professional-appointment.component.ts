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

  availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

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

  loadAvailableTimes() {
    if (this.selectedDate) {
      // Simular horarios disponibles
      this.availableTimes = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
      ];
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