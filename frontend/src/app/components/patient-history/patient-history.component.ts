import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientHistoryService } from '../../services/patient-history.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-patient-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-history.component.html',
  styleUrls: ['./patient-history.component.css']
})
export class PatientHistoryComponent implements OnInit {
  patientId!: number;
  patient: any = null;
  history: any[] = [];
  loading = false;
  
  // Filtros
  searchTerm = '';
  startDate = '';
  endDate = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientHistoryService: PatientHistoryService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.patientId = +params['id'];
      this.loadPatientHistory();
    });
  }

  loadPatientHistory(): void {
    this.loading = true;
    const filters = {
      search: this.searchTerm,
      startDate: this.startDate,
      endDate: this.endDate
    };

    this.patientHistoryService.getPatientHistory(this.patientId, filters).subscribe({
      next: (response) => {
        this.patient = response.patient;
        this.history = response.history;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando historial:', error);
        this.notificationService.error('Error', 'No se pudo cargar el historial del paciente');
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.loadPatientHistory();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.startDate = '';
    this.endDate = '';
    this.loadPatientHistory();
  }

  goBack(): void {
    this.router.navigate(['/app/professional-dashboard']);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-AR');
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'completed': 'Completada',
      'confirmed': 'Confirmada',
      'cancelled': 'Cancelada'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'completed': 'status-completed',
      'confirmed': 'status-confirmed',
      'cancelled': 'status-cancelled'
    };
    return classMap[status] || '';
  }
}