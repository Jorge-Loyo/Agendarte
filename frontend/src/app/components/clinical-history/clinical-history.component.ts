import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProfessionalService } from '../../services/professional.service';

@Component({
  selector: 'app-clinical-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './clinical-history.component.html',
  styleUrls: ['./clinical-history.component.css']
})
export class ClinicalHistoryComponent implements OnInit {
  patients: any[] = [];
  searchTerm = '';
  loading = false;

  constructor(
    private professionalService: ProfessionalService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
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

  viewPatientHistory(patientId: number) {
    this.router.navigate(['/app/medical-record', patientId]);
  }
}