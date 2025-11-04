import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-meet-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meet-config.component.html',
  styleUrls: ['./meet-config.component.css']
})
export class MeetConfigComponent implements OnInit {
  meetLink = '';
  loading = false;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadMeetConfig();
  }

  loadMeetConfig() {
    const saved = localStorage.getItem('professional_meet_link');
    if (saved) {
      this.meetLink = saved;
    }
  }

  saveMeetConfig() {
    if (!this.meetLink.trim()) {
      this.notificationService.error('Error', 'Por favor ingresa un enlace válido');
      return;
    }

    if (!this.isValidMeetLink(this.meetLink)) {
      this.notificationService.error('Error', 'Por favor ingresa un enlace válido de Google Meet');
      return;
    }

    this.loading = true;
    localStorage.setItem('professional_meet_link', this.meetLink);
    
    setTimeout(() => {
      this.loading = false;
      this.notificationService.success('Éxito', 'Enlace de Meet guardado correctamente');
    }, 500);
  }

  isValidMeetLink(link: string): boolean {
    return link.includes('meet.google.com') || link.includes('hangouts.google.com');
  }

  openMeet() {
    if (this.meetLink) {
      window.open(this.meetLink, '_blank');
    } else {
      this.notificationService.warning('Aviso', 'Primero configura tu enlace de Meet');
    }
  }

  clearMeetConfig() {
    if (confirm('¿Estás seguro de eliminar la configuración de Meet?')) {
      this.meetLink = '';
      localStorage.removeItem('professional_meet_link');
      this.notificationService.success('Éxito', 'Configuración eliminada');
    }
  }
}