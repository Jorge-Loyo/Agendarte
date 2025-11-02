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
  
  appointments = [
    {
      id: 1,
      date: '2024-11-15',
      time: '10:30',
      professional: 'Dr. Carlos García',
      specialty: 'Cardiología',
      status: 'confirmed',
      price: 8000,
      location: 'Buenos Aires',
      notes: 'Control rutinario'
    },
    {
      id: 2,
      date: '2024-11-20',
      time: '14:00',
      professional: 'Dra. Ana López',
      specialty: 'Dermatología',
      status: 'pending',
      price: 7500,
      location: 'Córdoba',
      notes: 'Consulta por lunar'
    },
    {
      id: 3,
      date: '2024-10-10',
      time: '09:00',
      professional: 'Dr. Miguel Rodríguez',
      specialty: 'Neurología',
      status: 'completed',
      price: 9000,
      location: 'Rosario',
      notes: 'Seguimiento migraña'
    }
  ];

  constructor(
    private router: Router,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.appointmentService.getMyAppointments().subscribe({
      next: (response) => {
        this.appointments = response.appointments || [];
      },
      error: (error) => {
        console.error('Error cargando turnos:', error);
        // Mantener datos simulados si falla la API
      }
    });
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