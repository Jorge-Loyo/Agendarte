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

  createUser() {
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

  deleteUser(user: any) {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.adminService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  deleteTestUsers() {
    if (confirm('¿Eliminar todos los usuarios de prueba?')) {
      // Implementar eliminación de usuarios de prueba
    }
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