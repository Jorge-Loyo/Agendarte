import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionsService } from '../services/permissions.service';
import { AuthService } from '../services/auth.service';

export const permissionsGuard: CanActivateFn = (route, state) => {
  const permissionsService = inject(PermissionsService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Obtener permisos requeridos de la ruta
  const requiredPermissions = route.data?.['requiredPermissions'] as string[];
  const requiredRoles = route.data?.['requiredRoles'] as string[];

  // Si no hay permisos específicos requeridos, permitir acceso
  if (!requiredPermissions && !requiredRoles) {
    return true;
  }

  const user = authService.getCurrentUser();
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  // Verificar roles requeridos
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    // Redireccionar según el rol del usuario
    if (user.role === 'professional') {
      router.navigate(['/app/professional-dashboard']);
    } else if (user.role === 'master') {
      router.navigate(['/app/admin']);
    } else {
      router.navigate(['/app/dashboard']);
    }
    return false;
  }

  // Verificar permisos requeridos
  if (requiredPermissions && !permissionsService.hasAnyPermission(requiredPermissions)) {
    // Redireccionar según el rol del usuario
    if (user.role === 'professional') {
      router.navigate(['/app/professional-dashboard']);
    } else if (user.role === 'master') {
      router.navigate(['/app/admin']);
    } else {
      router.navigate(['/app/dashboard']);
    }
    return false;
  }

  return true;
};

// Guard específico para funciones administrativas
export const adminPermissionsGuard: CanActivateFn = (route, state) => {
  const permissionsService = inject(PermissionsService);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const user = authService.getCurrentUser();
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  // Verificar si tiene permisos administrativos
  const hasAdminPermissions = permissionsService.hasAnyPermission([
    'admin_dashboard',
    'manage_users',
    'manage_permissions'
  ]);

  if (!hasAdminPermissions) {
    // Redireccionar según el rol del usuario
    if (user.role === 'professional') {
      router.navigate(['/app/professional-dashboard']);
    } else {
      router.navigate(['/app/dashboard']);
    }
    return false;
  }

  return true;
};

// Guard específico para profesionales
export const professionalPermissionsGuard: CanActivateFn = (route, state) => {
  const permissionsService = inject(PermissionsService);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const user = authService.getCurrentUser();
  if (!user || user.role !== 'professional') {
    // Redireccionar según el rol del usuario
    if (user?.role === 'master') {
      router.navigate(['/app/admin']);
    } else {
      router.navigate(['/app/dashboard']);
    }
    return false;
  }

  // Verificar permisos específicos de profesional si es necesario
  const requiredPermissions = route.data?.['requiredPermissions'] as string[];
  if (requiredPermissions && !permissionsService.hasAnyPermission(requiredPermissions)) {
    router.navigate(['/app/professional-dashboard']);
    return false;
  }

  return true;
};