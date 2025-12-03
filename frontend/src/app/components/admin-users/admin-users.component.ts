import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  loading = false;
  showCreateForm = false;
  currentUser: any;
  
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
    { value: 'admin', label: 'Administrador' },
    { value: 'master', label: 'Master' }
  ];

  specialties: any[] = [];

  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadUsers();
    this.loadSpecialties();
    this.filteredUsers = [...this.users];
  }

  loadUsers() {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: (users: any) => {
        this.users = users.users || users;
        this.filteredUsers = [...this.users];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
        this.loading = false;
      }
    });
  }

  loadSpecialties() {
    this.adminService.getSpecialties().subscribe({
      next: (specialties: any) => {
        this.specialties = specialties;
      },
      error: (error: any) => {
        console.error('Error loading specialties:', error);
      }
    });
  }

  validatePassword(password: string): { valid: boolean; message: string } {
    if (password.length < 8) {
      return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Debe incluir al menos una mayúscula' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Debe incluir al menos una minúscula' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Debe incluir al menos un número' };
    }
    return { valid: true, message: '' };
  }

  createUser() {
    const validation = this.validatePassword(this.newUser.password);
    if (!validation.valid) {
      this.openModal({
        title: '❌ Contraseña inválida',
        message: validation.message,
        type: 'error',
        confirmText: 'Aceptar'
      });
      return;
    }

    this.adminService.createUser(this.newUser).subscribe({
      next: () => {
        this.loadUsers();
        this.resetForm();
        this.showCreateForm = false;
      },
      error: (error) => {
        console.error('Error creating user:', error);
      }
    });
  }

  resetForm() {
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
    return this.currentUser?.role === 'master' || 
           (this.currentUser?.role === 'admin' && user.role !== 'master');
  }

  canDeleteUser(user: any): boolean {
    return this.currentUser?.role === 'master' && user.id !== this.currentUser.id;
  }

  showEditForm = false;
  editingUser: any = null;

  editUser(user: any) {
    this.editingUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      dni: user.profile?.dni || '',
      phone: user.profile?.phone || '',
      specialty: user.professional?.specialty || '',
      licenseNumber: user.professional?.licenseNumber || '',
      password: ''
    };
    this.showEditForm = true;
  }

  updateUser() {
    if (this.editingUser.password) {
      const validation = this.validatePassword(this.editingUser.password);
      if (!validation.valid) {
        this.openModal({
          title: '❌ Contraseña inválida',
          message: validation.message,
          type: 'error',
          confirmText: 'Aceptar'
        });
        return;
      }
    }

    this.adminService.updateUser(this.editingUser.id, this.editingUser).subscribe({
      next: () => {
        this.loadUsers();
        this.cancelEdit();
      },
      error: (error: any) => {
        console.error('Error updating user:', error);
      }
    });
  }

  cancelEdit() {
    this.showEditForm = false;
    this.editingUser = null;
  }

  toggleUserStatus(user: any) {
    const newStatus = !user.isActive;
    this.adminService.updateUserRole(user.id, { role: user.role, isActive: newStatus }).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (error: any) => {
        console.error('Error updating user status:', error);
      }
    });
  }

  // Modal state
  showModal = false;
  modalConfig: any = {};

  openModal(config: any) {
    this.modalConfig = config;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.modalConfig = {};
  }

  deleteUser(user: any) {
    this.openModal({
      title: '¿Eliminar usuario?',
      message: `¿Estás seguro de eliminar a ${user.profile?.firstName} ${user.profile?.lastName}?`,
      type: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        this.adminService.deleteUser(user.id).subscribe({
          next: () => {
            this.loadUsers();
            this.openModal({
              title: '✅ Usuario eliminado',
              message: 'El usuario ha sido eliminado exitosamente',
              type: 'success',
              confirmText: 'Aceptar'
            });
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.openModal({
              title: '❌ Error',
              message: 'No se pudo eliminar el usuario',
              type: 'error',
              confirmText: 'Aceptar'
            });
          }
        });
      }
    });
  }

  deleteTestUsers() {
    this.openModal({
      title: '¿Eliminar usuarios de prueba?',
      message: 'Esta acción no se puede deshacer',
      type: 'warning',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        // Implementar eliminación
      }
    });
  }

  resetPassword(user: any) {
    this.openModal({
      title: '¿Resetear contraseña?',
      message: `Se generará una nueva contraseña para ${user.email}`,
      type: 'warning',
      confirmText: 'Resetear',
      cancelText: 'Cancelar',
      onConfirm: () => {
        this.adminService.resetUserPassword(user.id).subscribe({
          next: (response: any) => {
            this.openModal({
              title: '🔑 Nueva contraseña generada',
              message: `<div style="background: #f7fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <strong style="font-size: 18px; color: #2d3748;">${response.tempPassword}</strong>
              </div>
              <p style="color: #718096; margin-top: 12px;">Guarda esta contraseña y compártela con el usuario.</p>`,
              type: 'success',
              confirmText: 'Copiar y Cerrar',
              onConfirm: () => {
                navigator.clipboard.writeText(response.tempPassword);
              }
            });
          },
          error: (error: any) => {
            console.error('Error resetting password:', error);
            this.openModal({
              title: '❌ Error',
              message: 'No se pudo resetear la contraseña',
              type: 'error',
              confirmText: 'Aceptar'
            });
          }
        });
      }
    });
  }

  selectedRole = '';
  filteredUsers: any[] = [];

  filterUsers() {
    if (!this.selectedRole) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(user => user.role === this.selectedRole);
    }
  }

  getUsersByRole(role: string): any[] {
    return this.users.filter(user => user.role === role);
  }

  goBack(): void {
    window.history.back();
  }
}