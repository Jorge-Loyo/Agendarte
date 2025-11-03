import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PermissionsService, RolePermissions, MenuOption } from '../../services/permissions.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-permissions-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './permissions-demo.component.html',
  styleUrls: ['./permissions-demo.component.css']
})
export class PermissionsDemoComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  userPermissions: any[] = [];
  availableMenuOptions: MenuOption[] = [];
  simulatedRole: string | null = null;
  simulatedMenuOptions: MenuOption[] = [];
  private destroy$ = new Subject<void>();

  availableRoles = [
    { key: 'patient', label: 'Paciente' },
    { key: 'professional', label: 'Profesional' },
    { key: 'admin', label: 'Administrativo' },
    { key: 'master', label: 'Master' }
  ];

  private roleLabels = {
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

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.loadUserPermissions();
        this.loadAvailableMenuOptions();
      });

    this.permissionsService.rolePermissions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadUserPermissions();
        this.loadAvailableMenuOptions();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserPermissions(): void {
    if (!this.currentUser) return;

    const rolePermissions = this.permissionsService.getRolePermissions();
    const userRole = rolePermissions.find(r => r.key === this.currentUser.role);
    
    if (userRole) {
      this.userPermissions = userRole.permissions;
    }
  }

  private loadAvailableMenuOptions(): void {
    this.availableMenuOptions = this.permissionsService.getAvailableMenuOptions();
  }

  getRoleLabel(role: string): string {
    return this.roleLabels[role as keyof typeof this.roleLabels] || role;
  }

  hasPermission(permissionKey: string): boolean {
    return this.permissionsService.hasPermission(permissionKey);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  simulateRole(roleKey: string): void {
    this.simulatedRole = roleKey;
    
    // Simular las opciones de menú para este rol
    const rolePermissions = this.permissionsService.getRolePermissions();
    const role = rolePermissions.find(r => r.key === roleKey);
    
    if (role) {
      // Crear un usuario temporal con el rol simulado
      const tempUser = { ...this.currentUser, role: roleKey };
      
      // Obtener las opciones de menú que tendría este rol
      // Nota: Esto es una simulación, en una implementación real necesitarías
      // una forma más sofisticada de simular el contexto del usuario
      this.simulatedMenuOptions = this.getMenuOptionsForRole(roleKey);
    }
  }

  private getMenuOptionsForRole(roleKey: string): MenuOption[] {
    // Mapeo manual de opciones por rol para la demostración
    const menuOptionsByRole: { [key: string]: MenuOption[] } = {
      'patient': [
        { key: 'dashboard', label: 'Dashboard', icon: '🏠', route: '/app/dashboard', requiredPermissions: [] },
        { key: 'my_appointments', label: 'Mis Turnos', icon: '📅', route: '/app/my-appointments', requiredPermissions: ['view_appointments'] },
        { key: 'find_professionals', label: 'Buscar Profesionales', icon: '👨⚕️', route: '/app/find-professionals', requiredPermissions: ['view_professionals'] },
        { key: 'profile', label: 'Mi Perfil', icon: '👤', route: '/app/profile', requiredPermissions: ['view_profile'] }
      ],
      'professional': [
        { key: 'dashboard', label: 'Dashboard', icon: '🏠', route: '/app/dashboard', requiredPermissions: [] },
        { key: 'professional_dashboard', label: 'Dashboard Profesional', icon: '🩺', route: '/app/professional-dashboard', requiredPermissions: ['professional_dashboard'] },
        { key: 'schedule_config', label: 'Configurar Horarios', icon: '⏰', route: '/app/schedule-config', requiredPermissions: ['manage_schedule'] },
        { key: 'my_reviews', label: 'Mis Reseñas', icon: '⭐', route: '/app/my-reviews', requiredPermissions: ['view_reviews'] },
        { key: 'profile', label: 'Mi Perfil', icon: '👤', route: '/app/profile', requiredPermissions: ['view_profile'] }
      ],
      'admin': [
        { key: 'dashboard', label: 'Dashboard', icon: '🏠', route: '/app/dashboard', requiredPermissions: [] },
        { key: 'admin_panel', label: 'Panel Administrativo', icon: '🛡️', route: '/app/admin', requiredPermissions: ['admin_dashboard'] },
        { key: 'profile', label: 'Mi Perfil', icon: '👤', route: '/app/profile', requiredPermissions: ['view_profile'] }
      ],
      'master': [
        { key: 'dashboard', label: 'Dashboard', icon: '🏠', route: '/app/dashboard', requiredPermissions: [] },
        { key: 'admin_panel', label: 'Panel Administrativo', icon: '🛡️', route: '/app/admin', requiredPermissions: ['admin_dashboard'] },
        { key: 'profile', label: 'Mi Perfil', icon: '👤', route: '/app/profile', requiredPermissions: ['view_profile'] }
      ]
    };

    return menuOptionsByRole[roleKey] || [];
  }

  resetSimulation(): void {
    this.simulatedRole = null;
    this.simulatedMenuOptions = [];
  }
}