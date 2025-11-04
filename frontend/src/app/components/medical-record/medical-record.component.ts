import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-medical-record',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './medical-record.component.html',
  styleUrls: ['./medical-record.component.css']
})
export class MedicalRecordComponent implements OnInit {
  patientId: number = 0;
  patient: any = {};
  loading = false;
  
  medicalRecord = {
    allergies: '',
    chronicDiseases: '',
    medications: '',
    surgeries: '',
    familyHistory: '',
    personalHistory: '',
    physicalExam: '',
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: ''
    },
    diagnosis: '',
    treatment: '',
    observations: '',
    nextAppointment: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.patientId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPatientData();
    this.loadMedicalRecord();
  }

  loadPatientData() {
    // Simular carga de datos del paciente
    this.patient = {
      id: this.patientId,
      firstName: 'Ana',
      lastName: 'Martínez',
      dni: '87654321',
      email: 'ana.martinez@test.com',
      phone: '+54911222222',
      birthDate: '1985-03-15',
      age: 38
    };
  }

  loadMedicalRecord() {
    // Aquí cargarías la historia clínica desde el backend
    // Por ahora dejamos los campos vacíos para que el profesional los complete
  }

  saveMedicalRecord() {
    this.loading = true;
    
    // Simular guardado
    setTimeout(() => {
      this.loading = false;
      alert('Historia clínica guardada exitosamente');
    }, 1000);
  }

  goBack() {
    this.router.navigate(['/app/clinical-history']);
  }
}