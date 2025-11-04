import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProfessionalService } from '../../services/professional.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-professional-patients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './professional-patients.component.html',
  styleUrls: ['./professional-patients.component.css']
})
export class ProfessionalPatientsComponent implements OnInit {
  myPatients: any[] = [];
  searchResults: any[] = [];
  loading = false;
  showAddPatient = false;
  showSearchPatients = false;
  searchTerm = '';
  patientSearchTerm = '';
  currentUser: any;
  whatsappLink = '';
  
  newPatient = {
    firstName: '',
    lastName: '',
    dni: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
    address: ''
  };

  constructor(
    private professionalService: ProfessionalService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadMyPatients();
  }

  loadMyPatients() {
    this.loading = true;
    this.professionalService.getMyPatients().subscribe({
      next: (response: any) => {
        console.log('Respuesta del servidor:', response);
        this.myPatients = Array.isArray(response) ? response : response.patients || [];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading patients:', error);
        this.myPatients = [];
        this.loading = false;
      }
    });
  }

  searchPatients() {
    if (this.patientSearchTerm.length < 2) {
      this.searchResults = [];
      return;
    }

    this.professionalService.searchPatients(this.patientSearchTerm).subscribe({
      next: (response: any) => {
        this.searchResults = (response.patients || []).filter((p: any) => 
          !this.myPatients.some(mp => mp.id === p.id)
        );
      },
      error: (error: any) => {
        console.error('Error searching patients:', error);
        this.searchResults = [];
      }
    });
  }

  addPatientToCartilla(patient: any) {
    this.professionalService.addPatientToCartilla(patient.id).subscribe({
      next: () => {
        this.loadMyPatients();
        this.searchPatients(); // Actualizar resultados de búsqueda
        alert(`${patient.firstName} ${patient.lastName} agregado a tu cartilla`);
      },
      error: (error: any) => {
        console.error('Error adding patient:', error);
        alert('Error al agregar paciente a la cartilla');
      }
    });
  }

  removePatientFromCartilla(patient: any) {
    if (confirm(`¿Remover a ${patient.firstName} ${patient.lastName} de tu cartilla?`)) {
      this.professionalService.removePatientFromCartilla(patient.id).subscribe({
        next: () => {
          this.myPatients = this.myPatients.filter(p => p.id !== patient.id);
          alert('Paciente removido de tu cartilla');
        },
        error: (error: any) => {
          console.error('Error removing patient:', error);
          alert('Error al remover paciente');
        }
      });
    }
  }
  
  viewPatientHistory(patientId: number) {
    this.router.navigate(['/app/patient-history', patientId]);
  }

  createPatient() {
    // Crear paciente directamente (el backend maneja si ya existe)
    this.loading = true;
    this.professionalService.createPatient(this.newPatient).subscribe({
      next: (response: any) => {
        if (response.existed) {
          alert('Paciente ya registrado - agregado a tu cartilla');
        } else {
          alert('Paciente creado exitosamente');
        }
        this.loadMyPatients();
        this.resetForm();
        this.showAddPatient = false;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error creating patient:', error);
        alert(error.error?.message || 'Error al crear paciente');
        this.loading = false;
      }
    });
        
        // Si DNI no existe, crear paciente


  }
  
  generateWhatsAppLink() {
    const baseUrl = window.location.origin;
    const registrationToken = this.generateToken();
    const registrationUrl = `${baseUrl}/register?token=${registrationToken}&phone=${this.newPatient.phone}`;
    
    const message = `Hola ${this.newPatient.firstName}, soy ${this.currentUser?.profile?.firstName} ${this.currentUser?.profile?.lastName}. Te invito a completar tu registro como paciente en nuestro sistema: ${registrationUrl}`;
    
    this.whatsappLink = `https://wa.me/${this.newPatient.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
  }
  
  generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  
  copyLink() {
    navigator.clipboard.writeText(this.whatsappLink).then(() => {
      alert('Enlace copiado al portapapeles');
    });
  }
  
  resetForm() {
    this.newPatient = {
      firstName: '',
      lastName: '',
      dni: '',
      email: '',
      phone: '',
      birthDate: '',
      gender: '',
      address: ''
    };
    this.whatsappLink = '';
  }
  
  get filteredPatients() {
    if (!this.searchTerm) return this.myPatients;
    return this.myPatients.filter(patient =>
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      patient.dni?.includes(this.searchTerm)
    );
  }

  toggleSearchPatients() {
    this.showSearchPatients = !this.showSearchPatients;
    if (!this.showSearchPatients) {
      this.patientSearchTerm = '';
      this.searchResults = [];
    }
  }

  onPatientSearchChange() {
    this.searchPatients();
  }
}