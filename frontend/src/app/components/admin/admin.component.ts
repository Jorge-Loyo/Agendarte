import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  loading = false;
  showCreateForm = false;
  currentUser: any = null;

  // Formulario de creación
  newUser = {
    email: '',
    password: '',
    role: 'patient',
    firstName: '',
    lastName: '',
    dni: '',
    phone: '',
    specialty: '',
    licenseNumber: ''
  };

  roles = [
    { value: 'patient', label: 'Paciente' },
    { value: 'professional', label: 'Profesional' },
    { value: 'admin', label: 'Administrativo' },
    { value: 'master', label: 'Master' }
  ];

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminService.getAllUsers().subscribe({
      next: (response) => {
        this.users = response.users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
        this.notificationService.error('Error', 'No se pudieron cargar los usuarios');
        this.loading = false;
      }
    });
  }

  createUser(): void {
    if (!this.newUser.email || !this.newUser.password || !this.newUser.firstName || !this.newUser.lastName) {
      this.notificationService.error('Error', 'Complete los campos obligatorios');
      return;
    }

    this.adminService.createUser(this.newUser).subscribe({
      next: (response) => {
        this.notificationService.success('Éxito', 'Usuario creado exitosamente');
        this.loadUsers();
        this.resetForm();
        this.showCreateForm = false;
      },
      error: (error) => {
        console.error('Error creando usuario:', error);
        this.notificationService.error('Error', error.error?.message || 'No se pudo crear el usuario');
      }
    });
  }

  updateUserRole(user: any, newRole: string): void {
    this.adminService.updateUserRole(user.id, { role: newRole, isActive: user.isActive }).subscribe({
      next: (response) => {
        this.notificationService.success('Éxito', 'Rol actualizado exitosamente');
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error actualizando rol:', error);
        this.notificationService.error('Error', 'No se pudo actualizar el rol');
      }
    });
  }

  toggleUserStatus(user: any): void {
    const newStatus = !user.isActive;
    this.adminService.updateUserRole(user.id, { role: user.role, isActive: newStatus }).subscribe({
      next: (response) => {
        this.notificationService.success('Éxito', `Usuario ${newStatus ? 'activado' : 'desactivado'} exitosamente`);
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error cambiando estado:', error);
        this.notificationService.error('Error', 'No se pudo cambiar el estado del usuario');
      }
    });
  }

  deleteUser(user: any): void {
    if (confirm(`¿Está seguro de desactivar al usuario ${user.email}?`)) {
      this.adminService.deleteUser(user.id).subscribe({
        next: (response) => {
          this.notificationService.success('Éxito', 'Usuario desactivado exitosamente');
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error desactivando usuario:', error);
          this.notificationService.error('Error', 'No se pudo desactivar el usuario');
        }
      });
    }
  }

  resetForm(): void {
    this.newUser = {
      email: '',
      password: '',
      role: 'patient',
      firstName: '',
      lastName: '',
      dni: '',
      phone: '',
      specialty: '',
      licenseNumber: ''
    };
  }

  getRoleLabel(role: string): string {
    const roleObj = this.roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  }

  canManageUser(user: any): boolean {
    if (this.currentUser?.role === 'master') return true;
    if (this.currentUser?.role === 'admin' && user.role !== 'master') return true;
    return false;
  }

  canDeleteUser(user: any): boolean {
    return this.currentUser?.role === 'master' && user.id !== this.currentUser.id;
  }
}