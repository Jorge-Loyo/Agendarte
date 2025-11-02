import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-professional-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './professional-dashboard.component.html',
  styleUrls: ['./professional-dashboard.component.css']
})
export class ProfessionalDashboardComponent implements OnInit {
  currentUser: User | null = null;
  currentDate = new Date();
  
  todayAppointments = [
    { id: 1, time: '09:00', patient: 'María García', reason: 'Control rutinario', status: 'confirmed' },
    { id: 2, time: '10:30', patient: 'Juan Pérez', reason: 'Consulta inicial', status: 'confirmed' },
    { id: 3, time: '14:00', patient: 'Ana López', reason: 'Seguimiento', status: 'pending' },
    { id: 4, time: '15:30', patient: 'Carlos Ruiz', reason: 'Control post-operatorio', status: 'confirmed' }
  ];

  weeklyStats = {
    totalAppointments: 28,
    completedAppointments: 24,
    cancelledAppointments: 2,
    pendingAppointments: 2,
    newPatients: 5,
    revenue: 12500
  };

  recentPatients = [
    { id: 1, name: 'María García', lastVisit: '2024-11-01', condition: 'Hipertensión', status: 'Estable' },
    { id: 2, name: 'Juan Pérez', lastVisit: '2024-10-28', condition: 'Diabetes tipo 2', status: 'En tratamiento' },
    { id: 3, name: 'Ana López', lastVisit: '2024-10-25', condition: 'Control rutinario', status: 'Saludable' }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
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
}