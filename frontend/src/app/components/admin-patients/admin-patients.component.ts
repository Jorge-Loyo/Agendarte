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
  loading = false;
  showCreatePatient = false;
  
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
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.loading = false;
      }
    });
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