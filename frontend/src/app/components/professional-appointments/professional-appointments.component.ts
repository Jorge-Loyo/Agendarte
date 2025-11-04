import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { NotificationService } from '../../services/notification.service';
import { GoogleCalendarService } from '../../services/google-calendar.service';

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
    private notificationService: NotificationService,
    private googleCalendarService: GoogleCalendarService
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

  deleteAppointment(appointment: any) {
    if (!confirm(`¿Estás seguro de eliminar la cita con ${appointment.patient || appointment.patientName}?`)) {
      return;
    }

    this.appointmentService.cancelProfessionalAppointment(appointment.id, 'Eliminada por profesional').subscribe({
      next: () => {
        // Intentar eliminar de Google Calendar si existe
        this.deleteFromGoogleCalendar(appointment);
        this.loadAppointments();
        this.notificationService.success('Éxito', 'Cita eliminada correctamente');
      },
      error: (error) => {
        this.notificationService.error('Error', 'No se pudo eliminar la cita');
      }
    });
  }

  private deleteFromGoogleCalendar(appointment: any) {
    // Buscar evento en Google Calendar por título
    this.googleCalendarService.getEvents().subscribe({
      next: (response: any) => {
        const events = response.events || [];
        const patientName = appointment.patient || appointment.patientName;
        const appointmentDate = appointment.appointmentDate;
        
        const matchingEvent = events.find((event: any) => {
          const eventDate = new Date(event.start?.dateTime || event.start?.date).toISOString().split('T')[0];
          return event.summary?.includes(patientName) && eventDate === appointmentDate;
        });
        
        if (matchingEvent) {
          this.googleCalendarService.deleteEvent(matchingEvent.id).subscribe({
            next: () => console.log('Evento eliminado de Google Calendar'),
            error: (error) => console.log('No se pudo eliminar de Google Calendar:', error)
          });
        }
      },
      error: (error) => console.log('Error buscando eventos:', error)
    });
  }

  navigateToNewAppointment() {
    window.location.href = '/app/professional-appointment';
  }
}