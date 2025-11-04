import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-professional-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './professional-appointments.component.html',
  styleUrls: ['./professional-appointments.component.css']
})
export class ProfessionalAppointmentsComponent implements OnInit {
  appointments: any[] = [];
  loading = false;

  constructor(
    private appointmentService: AppointmentService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading = true;
    this.appointmentService.getProfessionalAppointments().subscribe({
      next: (response) => {
        this.appointments = response.appointments || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando citas:', error);
        this.appointments = [];
        this.loading = false;
        this.notificationService.error('Error', 'No se pudieron cargar las citas');
      }
    });
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      case 'completed': return 'status-completed';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch(status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      case 'completed': return 'Completada';
      default: return status;
    }
  }
}