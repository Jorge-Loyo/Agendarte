import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-professional-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
    private patientService: PatientService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  searchPatients() {
    if (this.searchTerm.length < 2) {
      this.patients = [];
      return;
    }

    this.patientService.searchPatients(this.searchTerm).subscribe({
      next: (response) => {
        this.patients = response.patients;
      },
      error: (error) => {
        console.error('Error searching patients:', error);
        this.patients = [];
      }
    });
  }

  selectPatient(patient: any) {
    this.selectedPatient = patient;
    this.step = 2;
  }

  loadAvailableTimes() {
    // En producción, cargar horarios disponibles del profesional
    // Por ahora usar horarios mock
    this.availableTimes = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
    ];
  }

  confirmAppointment() {
    if (!this.currentUser?.professional) {
      this.notificationService.error('Error', 'No se pudo identificar el profesional');
      return;
    }

    const appointmentData = {
      patientId: this.selectedPatient.id,
      professionalId: this.currentUser.professional.id,
      date: this.selectedDate,
      time: this.selectedTime,
      notes: this.notes,
      createdByProfessional: true
    };

    this.loading = true;
    this.appointmentService.createAppointment(appointmentData).subscribe({
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