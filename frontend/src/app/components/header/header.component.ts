import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PermissionsService, MenuOption } from '../../services/permissions.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  userProfile: any = null;
  isMenuOpen = false;
  availableMenuOptions: MenuOption[] = [];
  private destroy$ = new Subject<void>();

  private roles = {
    'patient': 'Paciente',
    'professional': 'Profesional',
    'admin': 'Administrativo',
    'master': 'Master'
  };

  constructor(
    private authService: AuthService,
    private permissionsService: PermissionsService,
    private router: Router
  ) {}

  ngOnInit() {
    // Forzar recarga de permisos para obtener los últimos cambios
    this.permissionsService.forceReloadPermissions();
    
    // Suscribirse a cambios de autenticación
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isLoggedIn = !!user;
        this.userProfile = user;
        this.updateMenuOptions();
      });

    // Suscribirse a cambios de permisos
    this.permissionsService.rolePermissions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateMenuOptions();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateMenuOptions() {
    if (this.isLoggedIn) {
      this.availableMenuOptions = this.permissionsService.getAvailableMenuOptions();
    } else {
      this.availableMenuOptions = [];
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  getRoleLabel(role: string): string {
    return this.roles[role as keyof typeof this.roles] || role;
  }

  getUserDisplayName(): string {
    if (this.userProfile?.profile?.firstName) {
      const lastName = this.userProfile.profile.lastName ? ` ${this.userProfile.profile.lastName}` : '';
      return `${this.userProfile.profile.firstName}${lastName}`;
    }
    return this.userProfile?.firstName || 'Usuario';
  }

  loadUserProfile() {
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.userProfile = null;
    this.isMenuOpen = false;
    this.router.navigate(['/login']);
  }
}