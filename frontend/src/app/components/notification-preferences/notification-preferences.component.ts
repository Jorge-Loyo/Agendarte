import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationPreferencesService } from '../../services/notification-preferences.service';
import { NotificationService } from '../../services/notification.service';

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
    reminderHours: 24
  };
  
  loading = false;
  saving = false;

  constructor(
    private router: Router,
    private preferencesService: NotificationPreferencesService,
    private notificationService: NotificationService
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
        this.notificationService.success('Éxito', 'Preferencias guardadas correctamente');
        this.saving = false;
      },
      error: (error) => {
        this.notificationService.error('Error', 'No se pudieron guardar las preferencias');
        this.saving = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/app/profile']);
  }
}