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
  }

  loadUsers() {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: (users: any) => {
        this.users = users.users || users;
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

  editUser(user: any) {
    // Implementar edición
  }

  toggleUserStatus(user: any) {
    // Implementar toggle de estado
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
}