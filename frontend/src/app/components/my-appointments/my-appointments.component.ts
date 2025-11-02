import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
    private appointmentService: AppointmentService,
    private notificationService: NotificationService
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

  canModifyAppointment(appointment: any): boolean {
    const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
    const now = new Date();
    const hoursUntil = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntil >= 24 && appointment.status !== 'cancelled' && appointment.status !== 'completed';
  }

  cancelAppointment(appointment: any) {
    if (!this.canModifyAppointment(appointment)) {
      this.notificationService.warning('No disponible', 'No se puede cancelar con menos de 24 horas de anticipación');
      return;
    }

    const reason = prompt('Motivo de cancelación (opcional):');
    
    this.appointmentService.cancelAppointment(appointment.id, reason || '').subscribe({
      next: (response) => {
        this.notificationService.success('Éxito', 'Turno cancelado exitosamente');
        this.loadAppointments();
      },
      error: (error) => {
        this.notificationService.error('Error', error.error?.message || 'Error al cancelar el turno');
      }
    });
  }

  rescheduleAppointment(appointment: any) {
    if (!this.canModifyAppointment(appointment)) {
      this.notificationService.warning('No disponible', 'No se puede reprogramar con menos de 24 horas de anticipación');
      return;
    }

    const newDate = prompt('Nueva fecha (YYYY-MM-DD):');
    const newTime = prompt('Nueva hora (HH:MM):');
    const reason = prompt('Motivo de reprogramación (opcional):');

    if (!newDate || !newTime) {
      this.notificationService.warning('Datos incompletos', 'Debe proporcionar fecha y hora');
      return;
    }

    this.appointmentService.rescheduleAppointment(appointment.id, newDate, newTime, reason || '').subscribe({
      next: (response) => {
        this.notificationService.success('Éxito', 'Turno reprogramado exitosamente');
        this.loadAppointments();
      },
      error: (error) => {
        this.notificationService.error('Error', error.error?.message || 'Error al reprogramar el turno');
      }
    });
  }

  goBack() {
    this.router.navigate(['/app/dashboard']);
  }
}