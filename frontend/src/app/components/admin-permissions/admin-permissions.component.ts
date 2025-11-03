import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PermissionsService } from '../../services/permissions.service';

@Component({
  selector: 'app-admin-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-permissions.component.html',
  styleUrls: ['./admin-permissions.component.css', '../admin/admin-permissions.css']
})
export class AdminPermissionsComponent implements OnInit {
  permissions: any[] = [];
  roles: string[] = [];
  permissionsMatrix: any = {};

  constructor(private permissionsService: PermissionsService) {}

  ngOnInit() {
    // Forzar recarga de permisos para obtener los últimos cambios
    this.permissionsService.forceReloadPermissions();
    this.loadPermissions();
  }

  loadPermissions() {
    this.permissions = this.permissionsService.getAllPermissions();
    this.roles = this.permissionsService.getAllRoles();
    this.permissionsMatrix = this.permissionsService.getPermissionsMatrix();
  }

  hasPermission(role: string, permission: string): boolean {
    return this.permissionsService.hasRolePermission(role, permission);
  }

  togglePermission(role: string, permission: string) {
    const currentValue = this.hasPermission(role, permission);
    this.permissionsService.togglePermission(role, permission, !currentValue);
    this.loadPermissions();
  }

  savePermissions() {
    this.permissionsService.savePermissions();
    alert('Permisos guardados correctamente');
  }

  resetPermissions() {
    if (confirm('¿Restablecer permisos a valores por defecto?')) {
      this.permissionsService.resetToDefaults();
      this.loadPermissions();
    }
  }

  getRoleColor(role: string): string {
    const colors: any = {
      'patient': '#4CAF50',
      'professional': '#2196F3', 
      'admin': '#FF9800',
      'master': '#9C27B0'
    };
    return colors[role] || '#666';
  }

  getRoleLabel(role: string): string {
    const labels: any = {
      'patient': 'Paciente',
      'professional': 'Profesional',
      'admin': 'Admin',
      'master': 'Master'
    };
    return labels[role] || role;
  }

  getRoleIcon(role: string): string {
    const icons: any = {
      'patient': '🧑⚕️',
      'professional': '👨⚕️',
      'admin': '👨💼',
      'master': '👑'
    };
    return icons[role] || '👤';
  }

  getPermissionCount(role: string): number {
    const rolePermissions = this.permissionsMatrix[role];
    if (!rolePermissions) return 0;
    return Object.values(rolePermissions).filter(enabled => enabled).length;
  }

  enableAllForRole(role: string): void {
    this.permissions.forEach(permission => {
      if (!this.hasPermission(role, permission.key)) {
        this.togglePermission(role, permission.key);
      }
    });
  }

  disableAllForRole(role: string): void {
    this.permissions.forEach(permission => {
      if (this.hasPermission(role, permission.key)) {
        this.togglePermission(role, permission.key);
      }
    });
  }

  copyPermissions(fromRole: string, toRole: string): void {
    this.permissions.forEach(permission => {
      const fromHasPermission = this.hasPermission(fromRole, permission.key);
      const toHasPermission = this.hasPermission(toRole, permission.key);
      
      if (fromHasPermission !== toHasPermission) {
        this.togglePermission(toRole, permission.key);
      }
    });
  }

  canModifyRole(role: string): boolean {
    // Solo el master puede modificar permisos de todos los roles
    const currentUser = this.permissionsService.getCurrentUser();
    return currentUser?.role === 'master';
  }

  getCurrentUser(): any {
    return this.permissionsService.getCurrentUser();
  }

  goBack(): void {
    window.history.back();
  }
}