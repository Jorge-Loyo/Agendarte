import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationPreferencesService } from '../../services/notification-preferences.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-notification-preferences',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notification-preferences.component.html',
  styleUrls: ['./notification-preferences.component.css']
})
export class NotificationPreferencesComponent implements OnInit {
  preferences = {
    emailReminders: true,
    whatsappReminders: false,
    reminderHours: 24,
    whatsappHours: 2,
    emailSubject: 'Recordatorio de Consulta - Agendarte',
    emailBody: 'Estimado/a profesional, le recordamos que tiene una consulta programada para mañana. Por favor, confirme su asistencia.',
    whatsappMessage: 'Hola! Le recordamos su consulta programada. Confirme su asistencia por favor.'
  };
  
  loading = false;
  saving = false;

  constructor(
    private router: Router,
    private preferencesService: NotificationPreferencesService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadPreferences();
  }

  loadPreferences() {
    this.loading = true;
    this.preferencesService.getPreferences().subscribe({
      next: (response) => {
        this.preferences = response.preferences;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando preferencias:', error);
        this.loading = false;
      }
    });
  }

  savePreferences() {
    this.saving = true;
    this.preferencesService.updatePreferences(this.preferences).subscribe({
      next: (response) => {
        this.toastService.showSuccess('✅ Configuración guardada correctamente');
        this.saving = false;
      },
      error: (error) => {
        this.toastService.showError('❌ Error al guardar la configuración');
        this.saving = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/app/profile']);
  }
}