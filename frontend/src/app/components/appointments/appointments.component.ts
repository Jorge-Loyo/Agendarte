import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProfessionalService } from '../../services/professional.service';
import { AppointmentService } from '../../services/appointment.service';
import { CalendarService } from '../../services/calendar.service';
import { NotificationService } from '../../services/notification.service';

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
  loading = false;
  
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private professionalService: ProfessionalService,
    private appointmentService: AppointmentService,
    private calendarService: CalendarService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadProfessionals();
    
    // Verificar si viene un profesional preseleccionado
    this.route.queryParams.subscribe(params => {
      if (params['professionalId']) {
        const professionalId = Number(params['professionalId']);
        // Preseleccionar el profesional cuando se carguen
        setTimeout(() => {
          const professional = this.professionals.find(p => p.id === professionalId);
          if (professional) {
            this.selectProfessional(professional);
          }
        }, 1000);
      }
    });
  }

  loadProfessionals() {
    this.loading = true;
    this.professionalService.getAllProfessionals().subscribe({
      next: (response) => {
        this.professionals = response.professionals.map((prof: any) => ({
          ...prof,
          image: '👨⚕️',
          experience: '10+ años'
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading professionals:', error);
        this.loading = false;
      }
    });
  }

  selectProfessional(professional: any) {
    this.selectedProfessional = professional;
    this.step = 2;
    this.loadAvailableTimes();
  }

  loadAvailableTimes() {
    if (this.selectedDate && this.selectedProfessional) {
      const date = new Date(this.selectedDate);
      this.calendarService.getProfessionalCalendar(
        this.selectedProfessional.id,
        date.getFullYear(),
        date.getMonth() + 1
      ).subscribe({
        next: (response) => {
          const dayData = response.calendar.find((day: any) => 
            day.date === this.selectedDate
          );
          this.availableTimes = dayData?.slots
            .filter((slot: any) => slot.available)
            .map((slot: any) => slot.time) || [];
        },
        error: (error) => {
          console.error('Error loading times:', error);
          this.availableTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
        }
      });
    }
  }

  selectDateTime() {
    if (this.selectedDate && this.selectedTime) {
      this.step = 3;
    }
  }

  onDateChange() {
    this.selectedTime = '';
    this.loadAvailableTimes();
  }

  confirmAppointment() {
    const appointmentData = {
      professionalId: this.selectedProfessional.id,
      date: this.selectedDate,
      time: this.selectedTime,
      notes: this.appointmentReason
    };
    
    this.loading = true;
    this.appointmentService.createAppointment(appointmentData).subscribe({
      next: (response) => {
        this.notificationService.success(
          'Cita agendada',
          'Tu cita ha sido agendada exitosamente'
        );
        this.router.navigate(['/app/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.error(
          'Error',
          error.error?.message || 'Error al agendar la cita'
        );
      }
    });
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