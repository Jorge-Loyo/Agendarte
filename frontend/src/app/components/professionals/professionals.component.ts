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
  
  // Filtros
  searchTerm = '';
  selectedSpecialty = '';
  selectedLocation = '';
  filteredProfessionals: any[] = [];
  
  locations = ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata'];
  
  scheduleData: { [key: string]: { start: string; end: string; active: boolean } } = {
    monday: { start: '', end: '', active: false },
    tuesday: { start: '', end: '', active: false },
    wednesday: { start: '', end: '', active: false },
    thursday: { start: '', end: '', active: false },
    friday: { start: '', end: '', active: false },
    saturday: { start: '', end: '', active: false },
    sunday: { start: '', end: '', active: false }
  };

  specialties = [
    'Cardiología', 'Dermatología', 'Neurología', 'Pediatría', 
    'Ginecología', 'Traumatología', 'Psiquiatría', 'Oftalmología',
    'Otorrinolaringología', 'Urología', 'Endocrinología', 'Gastroenterología'
  ];

  professionals = this.getInitialProfessionals();

  constructor(private router: Router) {}

  ngOnInit() {
    this.filteredProfessionals = [...this.professionals];
  }

  applyFilters() {
    this.filteredProfessionals = this.professionals.filter(prof => {
      const searchTerm = this.searchTerm.toLowerCase();
      const matchesSearch = prof.name.toLowerCase().includes(searchTerm) ||
                           prof.specialty.toLowerCase().includes(searchTerm);
      const matchesSpecialty = !this.selectedSpecialty || prof.specialty === this.selectedSpecialty;
      const matchesLocation = !this.selectedLocation || prof.location === this.selectedLocation;
      
      return matchesSearch && matchesSpecialty && matchesLocation;
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedSpecialty = '';
    this.selectedLocation = '';
    this.filteredProfessionals = [...this.professionals];
  }

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
      status: 'Pendiente',
      location: this.selectedLocation || ''
    });
    
    this.toggleForm();
  }

  goBack() {
    this.router.navigate(['/app/dashboard']);
  }

  private getInitialProfessionals() {
    return [
      { id: 1, name: 'Dr. Carlos García', specialty: 'Cardiología', email: 'carlos@example.com', status: 'Activo', location: 'Buenos Aires' },
      { id: 2, name: 'Dra. Ana López', specialty: 'Dermatología', email: 'ana@example.com', status: 'Activo', location: 'Córdoba' },
      { id: 3, name: 'Dr. Miguel Rodríguez', specialty: 'Neurología', email: 'miguel@example.com', status: 'Pendiente', location: 'Rosario' },
      { id: 4, name: 'Dra. Laura Martínez', specialty: 'Pediatría', email: 'laura@example.com', status: 'Activo', location: 'Buenos Aires' },
      { id: 5, name: 'Dr. Juan Pérez', specialty: 'Cardiología', email: 'juan@example.com', status: 'Activo', location: 'Mendoza' }
    ];
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