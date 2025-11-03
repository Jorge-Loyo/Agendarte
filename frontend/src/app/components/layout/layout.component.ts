import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../../services/auth.service';
import { PermissionsService, MenuOption } from '../../services/permissions.service';

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
          <div class="menu-section" *ngFor="let section of menuSections">
            <h4>{{ section.title }}</h4>
            <div class="menu-item" 
                 *ngFor="let option of section.options" 
                 [routerLink]="option.route"
                 routerLinkActive="active">
              <span class="menu-icon">{{ option.icon }}</span>
              <span class="menu-title">{{ option.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Global Hamburger Button -->
      <button class="hamburger-btn" [class.active]="sidebarOpen" (click)="toggleSidebar()">
        <span [class.rotate1]="sidebarOpen"></span>
        <span [class.fade]="sidebarOpen"></span>
        <span [class.rotate2]="sidebarOpen"></span>
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
      left: -320px;
      width: 320px;
      height: 100vh;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      box-shadow: 2px 0 20px rgba(0, 0, 0, 0.15);
      transition: left 0.3s ease;
      z-index: 1000;
      overflow-y: auto;
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
      padding: 10px 0;
    }

    .menu-section {
      margin-bottom: 25px;
    }

    .menu-section h4 {
      color: var(--primary-color);
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 10px 20px;
      padding-bottom: 5px;
      border-bottom: 1px solid rgba(74, 144, 164, 0.2);
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      color: inherit;
      border-radius: 0 25px 25px 0;
      margin-right: 10px;
    }

    .menu-item:hover {
      background: linear-gradient(90deg, rgba(74, 144, 164, 0.1), rgba(74, 144, 164, 0.05));
      transform: translateX(5px);
    }

    .menu-item.active {
      background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
      color: white;
    }

    .menu-icon {
      font-size: 1.3rem;
      width: 24px;
      text-align: center;
    }

    .menu-title {
      font-weight: 500;
      font-size: 0.95rem;
      color: var(--primary-dark);
    }

    .menu-item:hover .menu-title,
    .menu-item.active .menu-title {
      color: inherit;
    }

    .hamburger-btn {
      position: fixed;
      top: 20px;
      left: 20px;
      width: 55px;
      height: 55px;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
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
      box-shadow: 0 4px 15px rgba(74, 144, 164, 0.3);
    }

    .hamburger-btn span {
      width: 20px;
      height: 2px;
      background: white;
      transition: all 0.3s ease;
    }

    .hamburger-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(74, 144, 164, 0.4);
    }

    .hamburger-btn.active {
      background: linear-gradient(135deg, var(--primary-dark), var(--primary-color));
    }

    .hamburger-btn span.rotate1 {
      transform: rotate(45deg) translate(5px, 5px);
    }

    .hamburger-btn span.fade {
      opacity: 0;
    }

    .hamburger-btn span.rotate2 {
      transform: rotate(-45deg) translate(7px, -6px);
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 280px;
        left: -280px;
      }
      
      .menu-section h4 {
        font-size: 0.8rem;
      }
      
      .menu-title {
        font-size: 0.9rem;
      }
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
export class LayoutComponent implements OnInit {
  sidebarOpen = false;
  menuSections: any[] = [];

  constructor(
    private authService: AuthService,
    private permissionsService: PermissionsService
  ) {}

  ngOnInit() {
    this.loadMenuSections();
  }

  loadMenuSections() {
    const availableOptions = this.permissionsService.getAvailableMenuOptions();
    
    // Usar todas las opciones disponibles sin filtros adicionales
    this.menuSections = [
      {
        title: 'Menú',
        options: availableOptions
      }
    ];
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}