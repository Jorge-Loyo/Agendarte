import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-professionals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './professionals.component.html',
  styleUrls: ['./professionals.component.css']
})
export class ProfessionalsComponent implements OnInit {
  showForm = false;
  
  professional = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: '',
    licenseNumber: '',
    experience: '',
    education: '',
    description: '',
    consultationFee: null as number | null
  };

  showScheduleModal = false;
  selectedProfessionalId: number | null = null;
  scheduleData = {
    monday: { start: '', end: '', active: false },
    tuesday: { start: '', end: '', active: false },
    wednesday: { start: '', end: '', active: false },
    thursday: { start: '', end: '', active: false },
    friday: { start: '', end: '', active: false },
    saturday: { start: '', end: '', active: false },
    sunday: { start: '', end: '', active: false }
  } as { [key: string]: { start: string; end: string; active: boolean } };

  specialties = [
    'Cardiología', 'Dermatología', 'Neurología', 'Pediatría', 
    'Ginecología', 'Traumatología', 'Psiquiatría', 'Oftalmología',
    'Otorrinolaringología', 'Urología', 'Endocrinología', 'Gastroenterología'
  ];

  professionals = [
    { id: 1, name: 'Dr. Carlos García', specialty: 'Cardiología', email: 'carlos@example.com', status: 'Activo' },
    { id: 2, name: 'Dra. Ana López', specialty: 'Dermatología', email: 'ana@example.com', status: 'Activo' },
    { id: 3, name: 'Dr. Miguel Rodríguez', specialty: 'Neurología', email: 'miguel@example.com', status: 'Pendiente' }
  ];

  constructor(private router: Router) {}

  ngOnInit() {}

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.professional = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialty: '',
      licenseNumber: '',
      experience: '',
      education: '',
      description: '',
      consultationFee: null
    };
  }

  openSchedule(professionalId: number) {
    this.selectedProfessionalId = professionalId;
    this.loadScheduleData(professionalId);
    this.showScheduleModal = true;
  }

  closeScheduleModal() {
    this.showScheduleModal = false;
    this.selectedProfessionalId = null;
  }

  loadScheduleData(professionalId: number) {
    // Simular carga de horarios desde backend
    // En producción aquí se haría una llamada al API
    this.scheduleData = {
      monday: { start: '09:00', end: '17:00', active: true },
      tuesday: { start: '09:00', end: '17:00', active: true },
      wednesday: { start: '09:00', end: '17:00', active: true },
      thursday: { start: '09:00', end: '17:00', active: true },
      friday: { start: '09:00', end: '17:00', active: true },
      saturday: { start: '', end: '', active: false },
      sunday: { start: '', end: '', active: false }
    };
  }

  saveSchedule() {
    console.log('Guardando horarios para profesional:', this.selectedProfessionalId);
    console.log('Horarios:', this.scheduleData);
    // Aquí se enviaría al backend
    this.closeScheduleModal();
  }

  onSubmit() {
    console.log('Nuevo profesional:', this.professional);
    // Aquí se enviaría al backend
    
    // Simular agregado a la lista
    this.professionals.push({
      id: this.professionals.length + 1,
      name: `${this.professional.firstName} ${this.professional.lastName}`,
      specialty: this.professional.specialty,
      email: this.professional.email,
      status: 'Pendiente'
    });
    
    this.toggleForm();
  }

  goBack() {
    this.router.navigate(['/app/dashboard']);
  }

  getDayName(key: string): string {
    const days: { [key: string]: string } = {
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo'
    };
    return days[key] || key;
  }
}