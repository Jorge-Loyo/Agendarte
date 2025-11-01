import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
  step = 1;
  selectedProfessional: any = null;
  selectedDate = '';
  selectedTime = '';
  appointmentReason = '';
  
  professionals = [
    { id: 1, name: 'Dr. Carlos García', specialty: 'Cardiología', rating: 4.8, experience: '15 años', image: '👨‍⚕️' },
    { id: 2, name: 'Dra. Ana López', specialty: 'Dermatología', rating: 4.9, experience: '12 años', image: '👩‍⚕️' },
    { id: 3, name: 'Dr. Miguel Rodríguez', specialty: 'Neurología', rating: 4.7, experience: '20 años', image: '👨‍⚕️' },
    { id: 4, name: 'Dra. Laura Martínez', specialty: 'Pediatría', rating: 4.9, experience: '10 años', image: '👩‍⚕️' }
  ];

  availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  constructor(private router: Router) {}

  ngOnInit() {}

  selectProfessional(professional: any) {
    this.selectedProfessional = professional;
    this.step = 2;
  }

  selectDateTime() {
    if (this.selectedDate && this.selectedTime) {
      this.step = 3;
    }
  }

  confirmAppointment() {
    const appointment = {
      professional: this.selectedProfessional,
      date: this.selectedDate,
      time: this.selectedTime,
      reason: this.appointmentReason
    };
    
    console.log('Nueva cita:', appointment);
    // Aquí se enviaría al backend
    
    this.router.navigate(['/app/dashboard']);
  }

  goBack() {
    if (this.step > 1) {
      this.step--;
    } else {
      this.router.navigate(['/app/dashboard']);
    }
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
}