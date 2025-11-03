import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotesService } from '../../services/notes.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-appointment-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment-notes.component.html',
  styleUrls: ['./appointment-notes.component.css']
})
export class AppointmentNotesComponent implements OnInit {
  appointmentId!: number;
  appointment: any = null;
  notes = '';
  originalNotes = '';
  loading = false;
  saving = false;
  autoSaveTimeout: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notesService: NotesService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.appointmentId = +params['id'];
      this.loadAppointmentNotes();
    });
  }

  loadAppointmentNotes(): void {
    this.loading = true;
    this.notesService.getAppointmentNotes(this.appointmentId).subscribe({
      next: (response) => {
        this.appointment = response.appointment;
        this.notes = response.appointment.notes || '';
        this.originalNotes = this.notes;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando notas:', error);
        this.notificationService.error('Error', 'No se pudieron cargar las notas');
        this.loading = false;
      }
    });
  }

  onNotesChange(): void {
    // Auto-save después de 2 segundos sin cambios
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
    
    this.autoSaveTimeout = setTimeout(() => {
      if (this.notes !== this.originalNotes) {
        this.saveNotes();
      }
    }, 2000);
  }

  saveNotes(): void {
    if (this.saving) return;
    
    this.saving = true;
    this.notesService.updateAppointmentNotes(this.appointmentId, this.notes).subscribe({
      next: (response) => {
        this.originalNotes = this.notes;
        this.saving = false;
        this.notificationService.success('Guardado', 'Notas guardadas automáticamente');
      },
      error: (error) => {
        console.error('Error guardando notas:', error);
        this.notificationService.error('Error', 'No se pudieron guardar las notas');
        this.saving = false;
      }
    });
  }

  manualSave(): void {
    this.saveNotes();
  }

  goBack(): void {
    this.router.navigate(['/app/professional-dashboard']);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-AR');
  }

  hasUnsavedChanges(): boolean {
    return this.notes !== this.originalNotes;
  }
}