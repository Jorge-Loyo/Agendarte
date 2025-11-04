import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProfessionalService } from '../../services/professional.service';
import { AuthService } from '../../services/auth.service';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  dni?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
}

interface NewPatient {
  firstName: string;
  lastName: string;
  dni?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
}

interface UserProfile {
  firstName?: string;
  lastName?: string;
}

interface User {
  profile?: UserProfile;
  // add other user fields if needed
}

@Component({
  selector: 'app-professional-patients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './professional-patients.component.html',
  styleUrls: ['./professional-patients.component.css']
})
export class ProfessionalPatientsComponent implements OnInit {
  myPatients: Patient[] = [];
  searchResults: Patient[] = [];
  loading = false;
  showAddPatient = false;
  showSearchPatients = false;
  searchTerm = '';
  patientSearchTerm = '';
  currentUser: User | null = null;
  whatsappLink = '';

  newPatient: NewPatient = {
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

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser() ?? null;
    this.loadMyPatients();
  }

  loadMyPatients(): void {
    this.loading = true;
    this.professionalService.getMyPatients().subscribe({
      next: (response: any) => {
        const patients: Patient[] = Array.isArray(response)
          ? response
          : (response?.patients ?? []);
        this.myPatients = patients;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading patients:', error);
        this.myPatients = [];
        this.loading = false;
      }
    });
  }

  searchPatients(): void {
    const term = this.patientSearchTerm?.trim() ?? '';
    if (term.length < 2) {
      this.searchResults = [];
      return;
    }

    this.professionalService.searchPatients(term).subscribe({
      next: (response: any) => {
        const patients: Patient[] = response?.patients ?? [];
        this.searchResults = patients.filter((p: Patient) =>
          !this.myPatients.some(mp => mp.id === p.id)
        );
      },
      error: (error: any) => {
        console.error('Error searching patients:', error);
        this.searchResults = [];
      }
    });
  }

  addPatientToCartilla(patient: Patient): void {
    this.professionalService.addPatientToCartilla(patient.id).subscribe({
      next: () => {
        this.loadMyPatients();
        this.searchPatients(); // refresh search results
        this.notify(`${patient.firstName} ${patient.lastName} agregado a tu cartilla`);
      },
      error: (error: any) => {
        console.error('Error adding patient:', error);
        this.notify('Error al agregar paciente a la cartilla');
      }
    });
  }

  removePatientFromCartilla(patient: Patient): void {
    if (!confirm(`¿Remover a ${patient.firstName} ${patient.lastName} de tu cartilla?`)) {
      return;
    }

    this.professionalService.removePatientFromCartilla(patient.id).subscribe({
      next: () => {
        this.myPatients = this.myPatients.filter(p => p.id !== patient.id);
        this.notify('Paciente removido de tu cartilla');
      },
      error: (error: any) => {
        console.error('Error removing patient:', error);
        this.notify('Error al remover paciente');
      }
    });
  }

  viewPatientHistory(patientId: number): void {
    this.router.navigate(['/app/patient-history', patientId]);
  }

  createPatient(): void {
    // backend handles existing patient case
    this.loading = true;
    this.professionalService.createPatient(this.newPatient).subscribe({
      next: (response: any) => {
        if (response?.existed) {
          this.notify('Paciente ya registrado - agregado a tu cartilla');
        } else {
          this.notify('Paciente creado exitosamente');
        }
        this.loadMyPatients();
        this.resetForm();
        this.showAddPatient = false;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error creating patient:', error);
        this.notify(error?.error?.message ?? 'Error al crear paciente');
        this.loading = false;
      }
    });
  }

  generateWhatsAppLink(): void {
    const phoneClean = (this.newPatient.phone ?? '').replace(/[^0-9]/g, '');
    if (!phoneClean) {
      this.notify('Ingrese un número de teléfono válido');
      return;
    }

    const baseUrl = window.location.origin;
    const registrationToken = this.generateToken();
    const registrationUrl = `${baseUrl}/register?token=${registrationToken}&phone=${phoneClean}`;

    const firstName = this.newPatient.firstName ?? '';
    const profName = `${this.currentUser?.profile?.firstName ?? ''} ${this.currentUser?.profile?.lastName ?? ''}`.trim();

    const message = `Hola ${firstName}, soy ${profName}. Te invito a completar tu registro como paciente en nuestro sistema: ${registrationUrl}`;

    this.whatsappLink = `https://wa.me/${phoneClean}?text=${encodeURIComponent(message)}`;
  }

  generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  async copyLink(): Promise<void> {
    if (!this.whatsappLink) {
      this.notify('No hay enlace para copiar');
      return;
    }
    try {
      await navigator.clipboard.writeText(this.whatsappLink);
      this.notify('Enlace copiado al portapapeles');
    } catch (err) {
      console.error('Error copying link:', err);
      this.notify('No se pudo copiar el enlace');
    }
  }

  resetForm(): void {
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

  get filteredPatients(): Patient[] {
    const term = this.searchTerm?.trim().toLowerCase() ?? '';
    if (!term) return this.myPatients;
    return this.myPatients.filter(patient =>
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(term) ||
      (patient.dni ?? '').includes(this.searchTerm)
    );
  }

  toggleSearchPatients(): void {
    this.showSearchPatients = !this.showSearchPatients;
    if (!this.showSearchPatients) {
      this.patientSearchTerm = '';
      this.searchResults = [];
    }
  }

  onPatientSearchChange(): void {
    this.searchPatients();
  }

  private notify(message: string): void {
    // centralize notifications for easier later replacement with a toast service
    window.alert(message);
  }
}