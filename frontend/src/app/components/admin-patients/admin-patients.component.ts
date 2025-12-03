import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-patients.component.html',
  styleUrls: ['./admin-patients.component.css']
})
export class AdminPatientsComponent implements OnInit {
  patients: any[] = [];
  filteredPatients: any[] = [];
  loading = false;
  showCreatePatient = false;
  searchTerm = '';
  
  newPatient = {
    email: '',
    firstName: '',
    lastName: '',
    dni: '',
    phone: '',
    age: null,
    address: '',
    emergencyContact: '',
    medicalHistory: ''
  };

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.loading = true;
    this.adminService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.filteredPatients = [...patients];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.loading = false;
      }
    });
  }

  filterPatients() {
    if (!this.searchTerm) {
      this.filteredPatients = [...this.patients];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredPatients = this.patients.filter(p => 
        p.firstName?.toLowerCase().includes(term) ||
        p.lastName?.toLowerCase().includes(term) ||
        p.email?.toLowerCase().includes(term) ||
        p.dni?.includes(term)
      );
    }
  }

  getActivePatients(): number {
    return this.patients.filter(p => p.isActive !== false).length;
  }

  getRecentPatients(): number {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.patients.filter(p => new Date(p.createdAt) >= thirtyDaysAgo).length;
  }

  goBack(): void {
    window.history.back();
  }

  createPatient() {
    this.adminService.createPatient(this.newPatient).subscribe({
      next: () => {
        this.loadPatients();
        this.resetPatientForm();
        this.showCreatePatient = false;
      },
      error: (error) => {
        console.error('Error creating patient:', error);
      }
    });
  }

  resetPatientForm() {
    this.newPatient = {
      email: '',
      firstName: '',
      lastName: '',
      dni: '',
      phone: '',
      age: null,
      address: '',
      emergencyContact: '',
      medicalHistory: ''
    };
  }

  editPatient(patient: any) {
    // Implementar edición
  }

  deletePatient(patient: any) {
    if (confirm('¿Estás seguro de eliminar este paciente?')) {
      this.adminService.deletePatient(patient.id).subscribe({
        next: () => {
          this.loadPatients();
        },
        error: (error: any) => {
          console.error('Error deleting patient:', error);
        }
      });
    }
  }
}