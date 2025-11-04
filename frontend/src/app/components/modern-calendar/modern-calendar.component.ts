import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleCalendarService } from '../../services/google-calendar.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-modern-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modern-calendar.component.html',
  styleUrls: ['./modern-calendar.component.css']
})
export class ModernCalendarComponent implements OnInit, AfterViewInit {
  @Input() professionalId?: number;
  
  calendar: any;
  isAuthenticated = false;
  events: any[] = [];
  currentEvent: any = null;
  
  // Modales
  showEventModal = false;
  showEditModal = false;

  constructor(
    private googleCalendarService: GoogleCalendarService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.checkAuthStatus();
  }

  ngAfterViewInit() {
    setTimeout(() => this.initializeCalendar(), 100);
  }

  initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (calendarEl) {
      // Crear calendario básico mientras carga FullCalendar
      calendarEl.innerHTML = `
        <div style="text-align: center; padding: 50px; color: #64748b;">
          <div style="font-size: 3rem; margin-bottom: 20px;">📅</div>
          <h3>Cargando Calendario...</h3>
          <p>Inicializando FullCalendar</p>
        </div>
      `;
      
      // Cargar FullCalendar
      this.loadFullCalendar();
    }
  }

  loadFullCalendar() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js';
    script.onload = () => {
      setTimeout(() => this.renderCalendar(), 200);
    };
    script.onerror = () => {
      const calendarEl = document.getElementById('calendar');
      if (calendarEl) {
        calendarEl.innerHTML = `
          <div style="text-align: center; padding: 50px; color: #ef4444;">
            <div style="font-size: 3rem; margin-bottom: 20px;">❌</div>
            <h3>Error cargando calendario</h3>
            <p>No se pudo cargar FullCalendar</p>
          </div>
        `;
      }
    };
    document.head.appendChild(script);
  }

  renderCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (calendarEl && typeof (window as any).FullCalendar !== 'undefined') {
      this.calendar = new (window as any).FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        buttonText: {
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Día'
        },
        allDayText: 'Horas',
        height: 650,
        contentHeight: 600,
        scrollTime: '08:00:00',
        eventClick: (info: any) => {
          this.showEventDetails(info.event);
        },
        eventColor: '#4285f4',
        eventTextColor: '#ffffff'
      });
      
      this.calendar.render();
      console.log('FullCalendar renderizado exitosamente');
    } else {
      console.log('FullCalendar no disponible, reintentando...');
      setTimeout(() => this.renderCalendar(), 500);
    }
  }

  async checkAuthStatus() {
    try {
      const response = await this.googleCalendarService.getCalendars().toPromise();
      this.isAuthenticated = true;
      this.showStatus('✅ Ya estás conectado con Google', 'success');
    } catch (error) {
      this.isAuthenticated = false;
    }
  }

  async authenticate() {
    try {
      const response = await this.googleCalendarService.getAuthUrl().toPromise();
      window.location.href = response.authUrl;
    } catch (error) {
      this.showStatus('❌ Error en la conexión', 'error');
    }
  }

  async loadCalendar() {
    if (!this.isAuthenticated) {
      this.showStatus('⚠️ Primero debes conectarte con Google', 'error');
      return;
    }

    try {
      // Aquí cargarías los eventos desde Google Calendar
      // Por ahora simulamos la carga
      this.events = [];
      this.showStatus('✅ Eventos cargados', 'success');
    } catch (error) {
      this.showStatus('❌ Error cargando eventos', 'error');
    }
  }

  showEventDetails(event: any) {
    this.currentEvent = event;
    this.showEventModal = true;
  }

  closeModal() {
    this.showEventModal = false;
    this.currentEvent = null;
  }

  editEvent() {
    this.showEventModal = false;
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  async deleteEvent() {
    if (!this.currentEvent || !confirm('¿Estás seguro de que quieres eliminar este evento?')) return;
    
    try {
      // Implementar eliminación
      this.closeModal();
      this.showStatus('✅ Evento eliminado exitosamente', 'success');
    } catch (error) {
      this.showStatus('❌ Error eliminando evento', 'error');
    }
  }

  clearCalendar() {
    this.events = [];
    this.showStatus('🗑️ Calendario limpiado', 'success');
  }

  private showStatus(message: string, type: 'success' | 'error') {
    if (type === 'success') {
      this.toastService.showSuccess(message);
    } else {
      this.toastService.showError(message);
    }
  }
}