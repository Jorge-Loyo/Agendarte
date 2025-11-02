import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-appointments.component.html',
  styleUrls: ['./my-appointments.component.css']
})
export class MyAppointmentsComponent implements OnInit {
  activeTab = 'upcoming';
  statusFilter = '';
  sortBy = 'date';
  appointments: any[] = [];
  loading = false;

  constructor(
    private router: Router,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading = true;
    this.appointmentService.getMyAppointments().subscribe({
      next: (response) => {
        this.appointments = this.formatAppointments(response.appointments || []);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando turnos:', error);
        this.loading = false;
      }
    });
  }

  formatAppointments(appointments: any[]): any[] {
    return appointments.map(apt => ({
      id: apt.id,
      date: apt.appointmentDate,
      time: apt.appointmentTime,
      professional: `${apt.professional?.user?.profile?.firstName || ''} ${apt.professional?.user?.profile?.lastName || ''}`.trim(),
      specialty: apt.professional?.specialty || 'No especificado',
      status: this.mapStatus(apt.status),
      price: apt.professional?.consultationPrice || 0,
      location: apt.professional?.user?.profile?.address || 'No especificado',
      notes: apt.notes || ''
    }));
  }

  mapStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'scheduled': 'pending',
      'confirmed': 'confirmed',
      'completed': 'completed',
      'cancelled': 'cancelled',
      'no_show': 'cancelled'
    };
    return statusMap[status] || status;
  }

  get upcomingAppointments() {
    const today = new Date();
    return this.appointments
      .filter(apt => new Date(apt.date) >= today)
      .filter(apt => !this.statusFilter || apt.status === this.statusFilter)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  get pastAppointments() {
    const today = new Date();
    return this.appointments
      .filter(apt => new Date(apt.date) < today)
      .filter(apt => !this.statusFilter || apt.status === this.statusFilter)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getStatusClass(status: string): string {
    const classes = {
      'confirmed': 'status-confirmed',
      'pending': 'status-pending',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    };
    return classes[status as keyof typeof classes] || '';
  }

  getStatusText(status: string): string {
    const texts = {
      'confirmed': 'Confirmado',
      'pending': 'Pendiente',
      'completed': 'Completado',
      'cancelled': 'Cancelado'
    };
    return texts[status as keyof typeof texts] || status;
  }

  viewDetails(appointment: any) {
    console.log('Ver detalles:', appointment);
  }

  goBack() {
    this.router.navigate(['/app/dashboard']);
  }
}