import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfessionalService } from '../../services/professional.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-professional-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './professional-patients.component.html',
  styleUrls: ['./professional-patients.component.css']
})
export class ProfessionalPatientsComponent implements OnInit {
  myPatients: any[] = [];
  availablePatients: any[] = [];
  loading = false;
  showAddPatient = false;
  searchTerm = '';
  currentUser: any;

  constructor(
    private professionalService: ProfessionalService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadMyPatients();
    this.loadAvailablePatients();
  }

  loadMyPatients() {
    this.loading = true;
    this.professionalService.getMyPatients().subscribe({
      next: (patients: any) => {
        this.myPatients = patients;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading patients:', error);
        this.loading = false;
      }
    });
  }

  loadAvailablePatients() {
    this.professionalService.getAvailablePatients().subscribe({
      next: (patients: any) => {
        this.availablePatients = patients.filter((p: any) => 
          !this.myPatients.some(mp => mp.id === p.id)
        );
      },
      error: (error: any) => {
        console.error('Error loading available patients:', error);
      }
    });
  }

  addPatientToCartilla(patient: any) {
    this.professionalService.addPatientToCartilla(patient.id).subscribe({
      next: () => {
        this.loadMyPatients();
        this.loadAvailablePatients();
        this.showAddPatient = false;
      },
      error: (error: any) => {
        console.error('Error adding patient:', error);
      }
    });
  }

  removePatientFromCartilla(patient: any) {
    if (confirm(`¿Remover a ${patient.firstName} ${patient.lastName} de tu cartilla?`)) {
      this.professionalService.removePatientFromCartilla(patient.id).subscribe({
        next: () => {
          this.loadMyPatients();
          this.loadAvailablePatients();
        },
        error: (error: any) => {
          console.error('Error removing patient:', error);
        }
      });
    }
  }

  get filteredAvailablePatients() {
    if (!this.searchTerm) return this.availablePatients;
    return this.availablePatients.filter(patient =>
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      patient.dni?.includes(this.searchTerm)
    );
  }
}