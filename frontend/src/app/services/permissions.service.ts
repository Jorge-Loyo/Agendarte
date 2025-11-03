import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Permission {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface RolePermissions {
  key: string;
  name: string;
  permissions: Permission[];
}

export interface MenuOption {
  key: string;
  label: string;
  icon: string;
  route: string;
  requiredPermissions: string[];
  requiredRoles?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private rolePermissionsSubject = new BehaviorSubject<RolePermissions[]>([]);
  public rolePermissions$ = this.rolePermissionsSubject.asObservable();

  private defaultRolePermissions: RolePermissions[] = [
    {
      key: 'patient',
      name: 'Paciente',
      permissions: [
        { key: 'view_appointments', name: 'Ver turnos', description: 'Ver mis turnos agendados', enabled: true },
        { key: 'create_appointments', name: 'Crear turnos', description: 'Agendar nuevos turnos', enabled: true },
        { key: 'cancel_appointments', name: 'Cancelar turnos', description: 'Cancelar mis turnos', enabled: true },
        { key: 'view_professionals', name: 'Ver profesionales', description: 'Ver lista de profesionales', enabled: true },
        { key: 'leave_reviews', name: 'Dejar reseñas', description: 'Dejar reseñas de profesionales', enabled: true },
        { key: 'view_profile', name: 'Ver perfil', description: 'Ver y editar mi perfil', enabled: true },
        { key: 'notification_preferences', name: 'Preferencias de notificación', description: 'Configurar notificaciones', enabled: true }
      ]
    },
    {
      key: 'professional',
      name: 'Profesional',
      permissions: [
        { key: 'manage_schedule', name: 'Gestionar horarios', description: 'Configurar horarios de atención', enabled: true },
        { key: 'view_patient_history', name: 'Ver historial pacientes', description: 'Acceder al historial médico', enabled: true },
        { key: 'manage_appointments', name: 'Gestionar turnos', description: 'Ver y gestionar turnos asignados', enabled: true },
        { key: 'add_notes', name: 'Agregar notas', description: 'Agregar notas a consultas', enabled: true },
        { key: 'view_statistics', name: 'Ver estadísticas', description: 'Ver estadísticas personales', enabled: true },
        { key: 'view_reviews', name: 'Ver reseñas', description: 'Ver reseñas recibidas', enabled: true },
        { key: 'professional_dashboard', name: 'Dashboard profesional', description: 'Acceso al dashboard profesional', enabled: true }
      ]
    },
    {
      key: 'admin',
      name: 'Administrativo',
      permissions: [
        { key: 'manage_all_appointments', name: 'Gestionar todos los turnos', description: 'Ver y gestionar todos los turnos', enabled: true },
        { key: 'register_patients', name: 'Registrar pacientes', description: 'Registrar nuevos pacientes', enabled: true },
        { key: 'view_reports', name: 'Ver reportes', description: 'Acceder a reportes del sistema', enabled: true },
        { key: 'process_payments', name: 'Procesar pagos', description: 'Gestionar pagos y facturación', enabled: true },
        { key: 'manage_specialties', name: 'Gestionar especialidades', description: 'Crear y editar especialidades', enabled: true },
        { key: 'admin_dashboard', name: 'Panel administrativo', description: 'Acceso al panel de administración', enabled: true }
      ]
    },
    {
      key: 'master',
      name: 'Master',
      permissions: [
        { key: 'manage_users', name: 'Gestionar usuarios', description: 'Crear, editar y eliminar usuarios', enabled: true },
        { key: 'manage_permissions', name: 'Gestionar permisos', description: 'Configurar permisos por rol', enabled: true },
        { key: 'view_system_logs', name: 'Ver logs del sistema', description: 'Acceder a logs de actividad', enabled: true },
        { key: 'reset_passwords', name: 'Resetear contraseñas', description: 'Resetear contraseñas de usuarios', enabled: true },
        { key: 'full_system_access', name: 'Acceso completo al sistema', description: 'Acceso total a todas las funciones', enabled: true },
        { key: 'delete_users', name: 'Eliminar usuarios', description: 'Eliminar usuarios del sistema', enabled: true }
      ]
    }
  ];

  private menuOptions: MenuOption[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: '🏠',
      route: '/app/dashboard',
      requiredPermissions: [],
      requiredRoles: ['patient', 'professional', 'admin', 'master']
    },
    {
      key: 'my_appointments',
      label: 'Mis Turnos',
      icon: '📅',
      route: '/app/my-appointments',
      requiredPermissions: ['view_appointments'],
      requiredRoles: ['patient']
    },
    {
      key: 'find_professionals',
      label: 'Buscar Profesionales',
      icon: '👨‍⚕️',
      route: '/app/find-professionals',
      requiredPermissions: ['view_professionals'],
      requiredRoles: ['patient']
    },
    {
      key: 'professional_dashboard',
      label: 'Dashboard Profesional',
      icon: '🩺',
      route: '/app/professional-dashboard',
      requiredPermissions: ['professional_dashboard'],
      requiredRoles: ['professional']
    },
    {
      key: 'schedule_config',
      label: 'Configurar Horarios',
      icon: '⏰',
      route: '/app/schedule-config',
      requiredPermissions: ['manage_schedule'],
      requiredRoles: ['professional']
    },
    {
      key: 'my_reviews',
      label: 'Mis Reseñas',
      icon: '⭐',
      route: '/app/my-reviews',
      requiredPermissions: ['view_reviews'],
      requiredRoles: ['professional']
    },
    {
      key: 'admin_panel',
      label: 'Panel Administrativo',
      icon: '🛡️',
      route: '/app/admin',
      requiredPermissions: ['admin_dashboard'],
      requiredRoles: ['admin', 'master']
    },
    {
      key: 'profile',
      label: 'Mi Perfil',
      icon: '👤',
      route: '/app/profile',
      requiredPermissions: ['view_profile'],
      requiredRoles: ['patient', 'professional', 'admin', 'master']
    },
    {
      key: 'notifications',
      label: 'Notificaciones',
      icon: '🔔',
      route: '/app/notification-preferences',
      requiredPermissions: ['notification_preferences'],
      requiredRoles: ['patient', 'professional', 'admin', 'master']
    }
  ];

  constructor(private authService: AuthService) {
    this.loadRolePermissions();
  }

  private loadRolePermissions(): void {
    // Cargar desde localStorage o usar valores por defecto
    const saved = localStorage.getItem('rolePermissions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.rolePermissionsSubject.next(parsed);
      } catch {
        this.rolePermissionsSubject.next(this.defaultRolePermissions);
      }
    } else {
      this.rolePermissionsSubject.next(this.defaultRolePermissions);
    }
  }

  getRolePermissions(): RolePermissions[] {
    return this.rolePermissionsSubject.value;
  }

  updateRolePermissions(rolePermissions: RolePermissions[]): void {
    this.rolePermissionsSubject.next(rolePermissions);
    localStorage.setItem('rolePermissions', JSON.stringify(rolePermissions));
  }

  togglePermission(roleKey: string, permissionKey: string, enabled: boolean): void {
    const rolePermissions = this.getRolePermissions();
    const role = rolePermissions.find(r => r.key === roleKey);
    if (role) {
      const permission = role.permissions.find(p => p.key === permissionKey);
      if (permission) {
        permission.enabled = enabled;
        this.updateRolePermissions(rolePermissions);
      }
    }
  }

  hasPermission(permissionKey: string): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    const rolePermissions = this.getRolePermissions();
    const userRole = rolePermissions.find(r => r.key === user.role);
    if (!userRole) return false;

    const permission = userRole.permissions.find(p => p.key === permissionKey);
    return permission ? permission.enabled : false;
  }

  hasAnyPermission(permissionKeys: string[]): boolean {
    return permissionKeys.some(key => this.hasPermission(key));
  }

  getAvailableMenuOptions(): MenuOption[] {
    const user = this.authService.getCurrentUser();
    if (!user) return [];

    return this.menuOptions.filter(option => {
      // Verificar rol requerido
      if (option.requiredRoles && !option.requiredRoles.includes(user.role)) {
        return false;
      }

      // Verificar permisos requeridos
      if (option.requiredPermissions.length > 0) {
        return this.hasAnyPermission(option.requiredPermissions);
      }

      return true;
    });
  }

  canAccessRoute(route: string): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    const menuOption = this.menuOptions.find(option => option.route === route);
    if (!menuOption) return true; // Si no está definido, permitir acceso

    // Verificar rol
    if (menuOption.requiredRoles && !menuOption.requiredRoles.includes(user.role)) {
      return false;
    }

    // Verificar permisos
    if (menuOption.requiredPermissions.length > 0) {
      return this.hasAnyPermission(menuOption.requiredPermissions);
    }

    return true;
  }

  resetToDefaults(): void {
    this.updateRolePermissions(this.defaultRolePermissions);
  }
}