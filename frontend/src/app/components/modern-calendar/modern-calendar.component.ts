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
  showEventTypeModal = false;
  showCreateEventModal = false;

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

    } else {

      setTimeout(() => this.renderCalendar(), 500);
    }
  }

  async checkAuthStatus() {
    try {
      const response = await this.googleCalendarService.getCalendars().toPromise();
      this.isAuthenticated = true;
      // Cargar eventos silenciosamente
      this.loadCalendarSilent();
    } catch (error) {
      this.isAuthenticated = false;
    }
  }

  async authenticate() {
    // Redirigir a la página de autenticación personalizada
    window.location.href = '/google-auth';
  }



  async loadCalendar() {
    if (!this.isAuthenticated) {
      this.showStatus('⚠️ Primero debes conectarte con Google', 'error');
      return;
    }
    await this.loadCalendarSilent();
    this.showStatus('✅ Eventos cargados', 'success');
  }

  async loadCalendarSilent() {
    if (!this.isAuthenticated) return;

    try {
      // Obtener eventos reales de Google Calendar
      const response = await this.googleCalendarService.getEvents().toPromise();
      
      // Convertir eventos de Google al formato FullCalendar
      const googleEvents = response.events.map((event: any) => ({
        title: event.summary || 'Sin título',
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        description: event.description || '',
        color: '#4285f4',
        extendedProps: {
          googleEventId: event.id,
          location: event.location,
          attendees: event.attendees
        }
      }));
      
      // Agregar eventos al calendario
      if (this.calendar) {
        this.calendar.removeAllEvents();
        this.calendar.addEventSource(googleEvents);
      }
      
      this.events = googleEvents;
    } catch (error) {

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

  showEventTypeModalDialog() {
    if (!this.isAuthenticated) {
      this.showStatus('⚠️ Primero debes conectarte con Google', 'error');
      return;
    }
    this.showEventTypeModal = true;
  }

  closeEventTypeModal() {
    this.showEventTypeModal = false;
  }

  async loadGoogleEvents() {
    this.closeEventTypeModal();
    await this.loadCalendarSilent();
    this.showStatus('✅ Eventos de Google Calendar cargados', 'success');
  }

  async loadEventType(type: 'evento' | 'cita') {
    this.closeEventTypeModal();
    
    if (type === 'evento') {
      this.showCreateEventModal = true;
    } else {
      window.location.href = '/app/professional-appointment';
    }
  }

  async loadMedicalAppointments() {
    try {
      // Cargar citas médicas del sistema Agendarte
      const response = await fetch('/api/appointments/professional', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const medicalEvents = data.appointments.map((apt: any) => ({
          title: `🩺 ${apt.patientName || 'Paciente'}`,
          start: `${apt.appointmentDate}T${apt.time}`,
          end: `${apt.appointmentDate}T${this.addHour(apt.time)}`,
          description: apt.reason || 'Cita médica',
          color: '#34a853',
          extendedProps: {
            type: 'medical',
            appointmentId: apt.id,
            patientName: apt.patientName,
            status: apt.status
          }
        }));
        
        if (this.calendar) {
          this.calendar.removeAllEvents();
          this.calendar.addEventSource(medicalEvents);
        }
        
        this.events = medicalEvents;
      }
    } catch (error) {

      this.showStatus('❌ Error cargando citas médicas', 'error');
    }
  }

  private addHour(time: string): string {
    const [hours, minutes] = time.split(':');
    const newHour = (parseInt(hours) + 1).toString().padStart(2, '0');
    return `${newHour}:${minutes}`;
  }

  closeCreateEventModal() {
    this.showCreateEventModal = false;
  }

  async createGoogleEvent(form: any) {
    if (!form.valid) {
      this.showStatus('⚠️ Por favor completa todos los campos requeridos', 'error');
      return;
    }

    const formData = form.value;
    
    try {
      const eventData = {
        title: formData.title,
        description: formData.description || '',
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString()
      };

      const response = await this.googleCalendarService.createEvent(eventData).toPromise();
      
      this.closeCreateEventModal();
      this.showStatus('✅ Evento creado exitosamente en Google Calendar', 'success');
      
      // Recargar eventos para mostrar el nuevo
      await this.loadCalendarSilent();
      
    } catch (error) {

      this.showStatus('❌ Error creando evento en Google Calendar', 'error');
    }
  }

  async deleteEvent() {
    if (!this.currentEvent || !confirm('¿Estás seguro de que quieres eliminar este evento?')) return;
    
    try {
      const eventId = this.currentEvent.extendedProps?.googleEventId;
      
      if (eventId) {
        try {
          await this.googleCalendarService.deleteEvent(eventId).toPromise();
        } catch (apiError) {
  
        }
      }
      
      // Eliminar del calendario visual
      this.currentEvent.remove();
      
      // Eliminar del array local
      this.events = this.events.filter(event => event !== this.currentEvent);
      
      this.closeModal();
      this.showStatus('✅ Evento eliminado del calendario', 'success');
    } catch (error) {

      this.showStatus('❌ Error eliminando evento', 'error');
    }
  }

  clearCalendar() {
    if (this.calendar) {
      this.calendar.removeAllEvents();
    }
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