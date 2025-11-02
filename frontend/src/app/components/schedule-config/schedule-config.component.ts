import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { ScheduleService } from '../../services/schedule.service';

interface DaySchedule {
  dayOfWeek: number;
  name: string;
  isActive: boolean;
  startTime: string;
  endTime: string;
  duration: number;
  specialHours?: SpecialHour[];
}

interface SpecialHour {
  date: string;
  startTime: string;
  endTime: string;
}

@Component({
  selector: 'app-schedule-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule-config.component.html',
  styleUrls: ['./schedule-config.component.css']
})
export class ScheduleConfigComponent implements OnInit {
  loading = false;
  defaultDuration = 30;
  breakTime = 5;
  
  weekDays: DaySchedule[] = [
    { dayOfWeek: 1, name: 'Lunes', isActive: true, startTime: '09:00', endTime: '17:00', duration: 30, specialHours: [] },
    { dayOfWeek: 2, name: 'Martes', isActive: true, startTime: '09:00', endTime: '17:00', duration: 30, specialHours: [] },
    { dayOfWeek: 3, name: 'Miércoles', isActive: true, startTime: '09:00', endTime: '17:00', duration: 30, specialHours: [] },
    { dayOfWeek: 4, name: 'Jueves', isActive: true, startTime: '09:00', endTime: '17:00', duration: 30, specialHours: [] },
    { dayOfWeek: 5, name: 'Viernes', isActive: true, startTime: '09:00', endTime: '17:00', duration: 30, specialHours: [] },
    { dayOfWeek: 6, name: 'Sábado', isActive: false, startTime: '09:00', endTime: '13:00', duration: 30, specialHours: [] },
    { dayOfWeek: 0, name: 'Domingo', isActive: false, startTime: '09:00', endTime: '13:00', duration: 30, specialHours: [] }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private scheduleService: ScheduleService
  ) {}

  ngOnInit() {
    this.loadCurrentSchedules();
  }

  loadCurrentSchedules() {
    this.scheduleService.getMySchedules().subscribe({
      next: (response) => {
        if (response.schedules && response.schedules.length > 0) {
          // Primero desactivar todos los días
          this.weekDays.forEach(day => day.isActive = false);
          
          response.schedules.forEach((schedule: any) => {
            const dayIndex = this.weekDays.findIndex(day => day.dayOfWeek === schedule.dayOfWeek);
            if (dayIndex !== -1) {
              this.weekDays[dayIndex].isActive = schedule.isActive;
              this.weekDays[dayIndex].startTime = schedule.startTime;
              this.weekDays[dayIndex].endTime = schedule.endTime;
              this.weekDays[dayIndex].duration = schedule.consultationDuration;
            }
          });
          
          // Actualizar configuración general basada en el primer día activo
          const firstActiveDay = this.weekDays.find(day => day.isActive);
          if (firstActiveDay) {
            this.defaultDuration = firstActiveDay.duration;
          }
        }
      },
      error: (error) => {
        console.log('No hay horarios previos o error:', error);
      }
    });
  }

  addSpecialHour(dayIndex: number) {
    if (!this.weekDays[dayIndex].specialHours) {
      this.weekDays[dayIndex].specialHours = [];
    }
    
    this.weekDays[dayIndex].specialHours!.push({
      date: '',
      startTime: this.weekDays[dayIndex].startTime,
      endTime: this.weekDays[dayIndex].endTime
    });
  }

  removeSpecialHour(dayIndex: number, specialIndex: number) {
    this.weekDays[dayIndex].specialHours!.splice(specialIndex, 1);
  }

  calculateSlots(day: DaySchedule): number {
    if (!day.isActive || !day.startTime || !day.endTime) return 0;
    
    const start = this.timeToMinutes(day.startTime);
    const end = this.timeToMinutes(day.endTime);
    const totalDuration = day.duration + this.breakTime;
    
    if (totalDuration <= 0 || end <= start) return 0;
    
    return Math.floor((end - start) / totalDuration);
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  saveSchedules() {
    this.loading = true;
    
    const schedules = this.weekDays
      .filter(day => day.isActive)
      .map(day => ({
        dayOfWeek: day.dayOfWeek,
        startTime: day.startTime,
        endTime: day.endTime,
        consultationDuration: day.duration,
        isActive: true
      }));

    this.scheduleService.updateMySchedules(schedules).subscribe({
      next: (response) => {
        this.loading = false;
        this.notificationService.success(
          'Horarios guardados',
          'Tus horarios de atención han sido actualizados'
        );
        this.router.navigate(['/app/professional-dashboard']);
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.error(
          'Error',
          'No se pudieron guardar los horarios'
        );
      }
    });
  }

  applyToAllDays() {
    this.weekDays.forEach(day => {
      if (day.isActive) {
        day.duration = Number(this.defaultDuration);
      }
    });
    // Forzar actualización de vista
    this.weekDays = [...this.weekDays];
    
    this.notificationService.info(
      'Configuración aplicada',
      `Duración de ${this.defaultDuration} min aplicada a todos los días activos`
    );
    // Guardar automáticamente
    this.saveSchedules();
  }

  trackByDay(index: number, day: DaySchedule): string {
    return `${day.dayOfWeek}-${day.duration}-${day.startTime}-${day.endTime}-${day.isActive}`;
  }

  goBack() {
    this.router.navigate(['/app/professional-dashboard']);
  }
}