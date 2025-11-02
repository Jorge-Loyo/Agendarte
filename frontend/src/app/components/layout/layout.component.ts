import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, RouterModule],
  template: `
    <div class="app-layout">
      <!-- Global Sidebar -->
      <div class="sidebar" [class.open]="sidebarOpen">
        <div class="sidebar-header">
          <h3>⚡ Acciones Rápidas</h3>
          <button class="close-btn" (click)="toggleSidebar()">×</button>
        </div>
        
        <div class="sidebar-menu">
          <div class="menu-item" routerLink="/app/dashboard">
            <div class="menu-icon">🏠</div>
            <div class="menu-text">
              <span class="menu-title">Dashboard</span>
              <span class="menu-desc">Panel principal</span>
            </div>
          </div>

          <div class="menu-item" routerLink="/app/appointments">
            <div class="menu-icon">📅</div>
            <div class="menu-text">
              <span class="menu-title">Citas</span>
              <span class="menu-desc">Gestionar citas</span>
            </div>
          </div>

          <div class="menu-item" routerLink="/app/find-professionals">
            <div class="menu-icon">👨⚕️</div>
            <div class="menu-text">
              <span class="menu-title">Buscar profesionales</span>
              <span class="menu-desc">Encuentra especialistas</span>
            </div>
          </div>

          <div class="menu-item" routerLink="/app/profile">
            <div class="menu-icon">👤</div>
            <div class="menu-text">
              <span class="menu-title">Mi perfil</span>
              <span class="menu-desc">Actualizar información</span>
            </div>
          </div>

          <div class="menu-item" routerLink="/app/my-appointments">
            <div class="menu-icon">📋</div>
            <div class="menu-text">
              <span class="menu-title">Mis Turnos</span>
              <span class="menu-desc">Ver citas agendadas</span>
            </div>
          </div>

          <div class="menu-item" routerLink="/app/admin">
            <div class="menu-icon">⚙️</div>
            <div class="menu-text">
              <span class="menu-title">Administración</span>
              <span class="menu-desc">Panel de admin</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Global Hamburger Button -->
      <button class="hamburger-btn" (click)="toggleSidebar()">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Sidebar Overlay -->
      <div class="sidebar-overlay" [class.active]="sidebarOpen" (click)="toggleSidebar()"></div>

      <app-header></app-header>
      <main class="main-content" [class.sidebar-open]="sidebarOpen">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    
    .main-content {
      flex: 1;
      background: linear-gradient(135deg, #f8fdff 0%, #e8f4f8 50%, #f0f8ff 100%);
      transition: margin-left 0.3s ease;
    }

    .main-content.sidebar-open {
      margin-left: 20px;
    }

    .sidebar {
      position: fixed;
      top: 0;
      left: -300px;
      width: 300px;
      height: 100vh;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(15px);
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
      transition: left 0.3s ease;
      z-index: 1000;
    }

    .sidebar.open {
      left: 0;
    }

    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid rgba(74, 144, 164, 0.1);
    }

    .sidebar-header h3 {
      margin: 0;
      color: var(--primary-dark);
      font-size: 1.2rem;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--text-secondary);
    }

    .sidebar-menu {
      padding: 20px 0;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      color: inherit;
    }

    .menu-item:hover {
      background: rgba(74, 144, 164, 0.1);
    }

    .menu-icon {
      font-size: 1.5rem;
      width: 30px;
      text-align: center;
    }

    .menu-text {
      display: flex;
      flex-direction: column;
    }

    .menu-title {
      font-weight: 600;
      color: var(--primary-dark);
    }

    .menu-desc {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .hamburger-btn {
      position: fixed;
      top: 20px;
      left: 20px;
      width: 50px;
      height: 50px;
      background: var(--primary-color);
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 4px;
      z-index: 1001;
      transition: all 0.3s ease;
    }

    .hamburger-btn span {
      width: 20px;
      height: 2px;
      background: white;
      transition: all 0.3s ease;
    }

    .hamburger-btn:hover {
      background: var(--primary-light);
      transform: scale(1.1);
    }

    .sidebar-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 999;
    }

    .sidebar-overlay.active {
      opacity: 1;
      visibility: visible;
    }
  `]
})
export class LayoutComponent {
  sidebarOpen = false;

  constructor(private authService: AuthService) {}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}