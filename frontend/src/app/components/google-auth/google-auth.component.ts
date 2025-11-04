import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { GoogleCalendarService } from '../../services/google-calendar.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-google-auth',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>🗓️ Conexión con Google Calendar</h1>
      
      <div class="auth-container">
        <h2>Paso 1: Autenticación</h2>
        <button (click)="authenticate()" class="btn-auth">🔐 Iniciar sesión con Google</button>
        <div>{{ authStatus }}</div>
      </div>

      <div class="profile-container">
        <h2>Paso 2: Perfil del usuario</h2>
        <button (click)="getProfile()" class="btn">👤 Obtener perfil</button>
        <div [innerHTML]="profileData"></div>
      </div>

      <div class="events-container">
        <h2>Paso 3: Eventos del calendario</h2>
        <button (click)="getCalendarEvents()" class="btn">📅 Obtener eventos</button>
        <div [innerHTML]="eventsData"></div>
      </div>
      
      <!-- Botones de navegación fuera de los pasos -->
      <div class="navigation-buttons">
        <button (click)="goToDashboard()" class="success-btn">
          📅 Ir al Dashboard
        </button>
        <button *ngIf="showLogoutButton" (click)="logout()" class="logout-btn">
          🚪 Cerrar Sesión Google
        </button>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
    .auth-container, .profile-container, .events-container { 
      background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; 
    }
    .btn, .btn-auth { 
      background: #4285f4; color: white; border: none; padding: 10px 20px; 
      border-radius: 4px; cursor: pointer; margin: 10px 5px; 
    }
    .btn:hover, .btn-auth:hover { background: #3367d6; }
    .event { 
      background: white; padding: 10px; margin: 10px 0; border-radius: 4px; 
      border-left: 4px solid #4285f4; 
    }
    .success-btn {
      background: #34a853; color: white; border: none; padding: 12px 24px; 
      border-radius: 4px; cursor: pointer; font-size: 16px; margin: 5px;
    }
    .logout-btn {
      background: #dc3545; color: white; border: none; padding: 12px 24px; 
      border-radius: 4px; cursor: pointer; font-size: 16px; margin: 5px;
    }
    .navigation-buttons {
      background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;
      text-align: center; border: 2px solid #34a853;
    }
  `]
})
export class GoogleAuthComponent implements OnInit {
  authStatus = '';
  profileData = '';
  eventsData = '';
  showSuccessButtons = false;
  showLogoutButton = false;

  constructor(
    private googleService: GoogleCalendarService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['success']) {
        this.authStatus = '✅ Autenticación exitosa';
        this.showSuccessButtons = true;
        this.showLogoutButton = true;
      } else if (params['error']) {
        this.authStatus = '❌ Error en autenticación';
        this.showSuccessButtons = false;
        this.showLogoutButton = false;
      }
    });
  }

  async authenticate() {
    try {
      const response = await this.googleService.getAuthUrl().toPromise();
      window.location.href = response.authUrl;
    } catch (error) {
      this.authStatus = '❌ Error iniciando autenticación';
    }
  }

  async getProfile() {
    try {
      this.profileData = `
        <h3>Información del usuario:</h3>
        <p><strong>Estado:</strong> Conectado con Google Calendar</p>
        <p><strong>Permisos:</strong> Lectura y escritura de calendario</p>
      `;
    } catch (error) {
      this.profileData = '❌ Error: Necesitas autenticarte primero';
    }
  }

  async getCalendarEvents() {
    try {
      const response = await this.googleService.getEvents().toPromise();
      
      let html = '<h3>Próximos eventos:</h3>';
      if (!response.events || response.events.length === 0) {
        html += '<p>No hay eventos próximos</p>';
      } else {
        response.events.forEach((event: any) => {
          const start = event.start.dateTime || event.start.date;
          html += `
            <div class="event">
              <strong>${event.summary || 'Sin título'}</strong><br>
              <small>📅 ${new Date(start).toLocaleString()}</small>
              ${event.description ? `<br><em>${event.description}</em>` : ''}
            </div>
          `;
        });
      }
      this.eventsData = html;
    } catch (error) {
      this.eventsData = '❌ Error: Necesitas autenticarte primero';
    }
  }

  goToDashboard() {
    this.router.navigate(['/app/professional-dashboard']);
  }

  logout() {
    console.log('Cerrando sesión de Google...');
    
    this.googleService.logout().subscribe({
      next: (response) => {
        console.log('Logout exitoso:', response);
        this.authStatus = '🚪 Sesión de Google cerrada exitosamente';
        this.showLogoutButton = false;
        this.profileData = '';
        this.eventsData = '';
        this.router.navigate(['/google-auth']);
      },
      error: (error) => {
        console.error('Error cerrando sesión:', error);
        this.authStatus = '❌ Error cerrando sesión';
      }
    });
  }
}