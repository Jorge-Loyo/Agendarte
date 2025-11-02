import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-medical-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medical-history.component.html',
  styleUrls: ['./medical-history.component.css']
})
export class MedicalHistoryComponent implements OnInit {
  currentUser: User | null = null;
  showAddForm = false;
  
  medicalHistory = {
    allergies: '',
    medications: '',
    chronicConditions: '',
    surgeries: '',
    familyHistory: '',
    bloodType: '',
    emergencyContact: '',
    emergencyPhone: ''
  };

  appointments = [
    {
      id: 1,
      date: '2024-10-15',
      professional: 'Dr. García',
      specialty: 'Cardiología',
      diagnosis: 'Control rutinario',
      treatment: 'Continuar medicación actual',
      notes: 'Presión arterial normal, ECG sin alteraciones'
    },
    {
      id: 2,
      date: '2024-09-20',
      professional: 'Dra. López',
      specialty: 'Dermatología',
      diagnosis: 'Dermatitis seborreica',
      treatment: 'Crema antifúngica',
      notes: 'Aplicar 2 veces al día por 2 semanas'
    }
  ];

  newRecord = {
    date: '',
    professional: '',
    specialty: '',
    diagnosis: '',
    treatment: '',
    notes: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/login']);
      } else {
        this.loadMedicalHistory();
      }
    });
  }

  loadMedicalHistory() {
    // Simular carga de historial médico
    this.medicalHistory = {
      allergies: 'Penicilina, Polen',
      medications: 'Enalapril 10mg (1 vez al día)',
      chronicConditions: 'Hipertensión arterial',
      surgeries: 'Apendicectomía (2015)',
      familyHistory: 'Diabetes tipo 2 (padre), Hipertensión (madre)',
      bloodType: 'O+',
      emergencyContact: 'María García (esposa)',
      emergencyPhone: '+54 11 1234-5678'
    };
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetNewRecord();
    }
  }

  resetNewRecord() {
    this.newRecord = {
      date: '',
      professional: '',
      specialty: '',
      diagnosis: '',
      treatment: '',
      notes: ''
    };
  }

  addRecord() {
    if (!this.newRecord.date || !this.newRecord.professional || !this.newRecord.diagnosis) {
      this.notificationService.warning('Campos requeridos', 'Complete los campos obligatorios');
      return;
    }

    const record = {
      id: this.appointments.length + 1,
      ...this.newRecord
    };

    this.appointments.unshift(record);
    this.notificationService.success('Éxito', 'Registro médico agregado correctamente');
    this.toggleAddForm();
  }

  updateMedicalInfo() {
    // Simular actualización
    this.notificationService.success('Éxito', 'Información médica actualizada');
  }

  goBack() {
    this.router.navigate(['/app/dashboard']);
  }
}