import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { SpecialtyService } from '../../services/specialty.service';
import { AdminAppointmentsComponent } from '../admin-appointments/admin-appointments.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminAppointmentsComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  specialties: any[] = [];
  patients: any[] = [];
  filteredPatients: any[] = [];
  professionals: any[] = [];
  loading = false;
  showCreateForm = false;
  showCreateSpecialty = false;
  showCreatePatient = false;
  showEditForm = false;
  currentUser: any = null;
  activeTab: 'users' | 'patients' | 'appointments' | 'specialties' | 'reports' = 'users';
  editingUser: any = null;
  patientSearchTerm = '';
  createAndSchedule = false;

  // Reportes
  reportData: any = null;
  reportFilters = {
    period: 'month',
    startDate: '',
    endDate: '',
    professionalId: ''
  };

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

  newSpecialty = {
    name: '',
    description: ''
  };

  newPatient = {
    email: '',
    firstName: '',
    lastName: '',
    dni: '',
    phone: '',
    age: null,
    gender: '',
    address: ''
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
    private authService: AuthService,
    private specialtyService: SpecialtyService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadUsers();
    this.loadSpecialties();
    this.loadPatients();
    this.loadProfessionals();
  }

  loadSpecialties(): void {
    this.specialtyService.getSpecialties().subscribe({
      next: (specialties) => {
        this.specialties = specialties;
      },
      error: (error) => {
        console.error('Error cargando especialidades:', error);
        this.notificationService.error('Error', 'No se pudieron cargar las especialidades');
      }
    });
  }

  createSpecialty(): void {
    if (!this.newSpecialty.name) {
      this.notificationService.error('Error', 'El nombre es requerido');
      return;
    }

    this.specialtyService.createSpecialty(this.newSpecialty).subscribe({
      next: (response) => {
        this.notificationService.success('Éxito', 'Especialidad creada exitosamente');
        this.loadSpecialties();
        this.resetSpecialtyForm();
        this.showCreateSpecialty = false;
      },
      error: (error) => {
        console.error('Error creando especialidad:', error);
        this.notificationService.error('Error', error.error?.message || 'No se pudo crear la especialidad');
      }
    });
  }

  toggleSpecialtyStatus(specialty: any): void {
    const newStatus = !specialty.isActive;
    this.specialtyService.updateSpecialty(specialty.id, { isActive: newStatus }).subscribe({
      next: (response) => {
        this.notificationService.success('Éxito', `Especialidad ${newStatus ? 'activada' : 'desactivada'}`);
        this.loadSpecialties();
      },
      error: (error) => {
        console.error('Error actualizando especialidad:', error);
        this.notificationService.error('Error', 'No se pudo actualizar la especialidad');
      }
    });
  }

  resetSpecialtyForm(): void {
    this.newSpecialty = {
      name: '',
      description: ''
    };
  }

  loadUsers(): void {
    this.loading = true;
    console.log('Cargando usuarios...');
    console.log('Token existe:', !!localStorage.getItem('token'));
    console.log('Usuario actual:', this.currentUser);
    
    this.adminService.getAllUsers().subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.users = response.users;
        this.loadProfessionals();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
        if (error.status === 401) {
          this.notificationService.error('Error', 'Sesión expirada. Por favor, inicia sesión nuevamente.');
        } else if (error.status === 403) {
          this.notificationService.error('Error', 'No tienes permisos para acceder a esta sección.');
        } else {
          this.notificationService.error('Error', 'No se pudieron cargar los usuarios');
        }
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

  onRoleChange(user: any, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newRole = target.value;
    this.updateUserRole(user, newRole);
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
    const hasImportantData = user.profile && (user.profile.dni || user.profile.phone);
    const action = hasImportantData ? 'desactivar' : 'eliminar';
    
    if (confirm(`¿Está seguro de ${action} al usuario ${user.email}?`)) {
      this.adminService.deleteUser(user.id).subscribe({
        next: (response) => {
          this.notificationService.success('Éxito', response.message);
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error eliminando usuario:', error);
          this.notificationService.error('Error', 'No se pudo eliminar el usuario');
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

  editUser(user: any): void {
    this.editingUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      dni: user.profile?.dni || '',
      phone: user.profile?.phone || '',
      password: '',
      specialty: user.professional?.specialty || '',
      licenseNumber: user.professional?.licenseNumber || ''
    };
    this.showEditForm = true;
  }

  updateUser(): void {
    if (!this.editingUser.email || !this.editingUser.firstName || !this.editingUser.lastName) {
      this.notificationService.error('Error', 'Complete los campos obligatorios');
      return;
    }

    this.adminService.updateUser(this.editingUser.id, this.editingUser).subscribe({
      next: (response) => {
        this.notificationService.success('Éxito', 'Usuario actualizado exitosamente');
        this.loadUsers();
        this.cancelEdit();
      },
      error: (error) => {
        console.error('Error actualizando usuario:', error);
        this.notificationService.error('Error', error.error?.message || 'No se pudo actualizar el usuario');
      }
    });
  }

  cancelEdit(): void {
    this.showEditForm = false;
    this.editingUser = null;
  }

  deleteTestUsers(): void {
    const testEmails = [
      'Prueba@test.com',
      'jorgenayaticmi@gmail.com',
      'prueba@prueba.com',
      'paciente@agendarte.com',
      'admin@test.com'
    ];
    
    if (confirm('¿Eliminar todos los usuarios de prueba?')) {
      testEmails.forEach(email => {
        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
          this.adminService.deleteUser(user.id).subscribe({
            next: () => console.log(`Usuario ${email} eliminado`),
            error: (error) => console.error(`Error eliminando ${email}:`, error)
          });
        }
      });
      
      setTimeout(() => this.loadUsers(), 1000);
    }
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
    if (this.currentUser?.role !== 'master' || user.id === this.currentUser.id) {
      return false;
    }
    // Permitir eliminar usuarios sin perfil o con perfil básico
    return !user.profile || (!user.profile.dni && !user.profile.phone);
  }

  // Métodos para gestión de pacientes
  loadPatients(): void {
    this.adminService.getPatients().subscribe({
      next: (response) => {
        this.patients = response.patients || [];
        this.filteredPatients = [...this.patients];
      },
      error: (error) => {
        console.error('Error cargando pacientes:', error);
        this.notificationService.error('Error', 'No se pudieron cargar los pacientes');
      }
    });
  }

  createPatient(): void {
    if (!this.newPatient.email || !this.newPatient.firstName || !this.newPatient.lastName || !this.newPatient.dni) {
      this.notificationService.error('Error', 'Complete los campos obligatorios');
      return;
    }

    const patientData = {
      ...this.newPatient,
      generatePassword: true,
      sendCredentials: true,
      createAndSchedule: this.createAndSchedule
    };

    this.adminService.createPatient(patientData).subscribe({
      next: (response) => {
        this.notificationService.success('Éxito', response.message || 'Paciente registrado exitosamente');
        this.loadPatients();
        this.resetPatientForm();
        this.showCreatePatient = false;
        
        if (this.createAndSchedule && response.patient) {
          this.scheduleForPatient(response.patient);
        }
      },
      error: (error) => {
        console.error('Error creando paciente:', error);
        this.notificationService.error('Error', error.error?.message || 'No se pudo registrar el paciente');
      }
    });
  }

  resetPatientForm(): void {
    this.newPatient = {
      email: '',
      firstName: '',
      lastName: '',
      dni: '',
      phone: '',
      age: null,
      gender: '',
      address: ''
    };
    this.createAndSchedule = false;
  }

  filterPatients(): void {
    if (!this.patientSearchTerm) {
      this.filteredPatients = [...this.patients];
      return;
    }

    const term = this.patientSearchTerm.toLowerCase();
    this.filteredPatients = this.patients.filter(patient => 
      patient.email.toLowerCase().includes(term) ||
      patient.profile?.firstName?.toLowerCase().includes(term) ||
      patient.profile?.lastName?.toLowerCase().includes(term) ||
      patient.profile?.dni?.includes(term)
    );
  }

  scheduleForPatient(patient: any): void {
    // Cambiar a la pestaña de turnos y pasar el paciente seleccionado
    this.activeTab = 'appointments';
    // Aquí se podría implementar la lógica para pre-seleccionar el paciente
    this.notificationService.success('Info', `Redirigiendo para agendar turno para ${patient.profile?.firstName} ${patient.profile?.lastName}`);
  }

  editPatient(patient: any): void {
    // Implementar edición de paciente
    this.notificationService.success('Info', 'Función de edición en desarrollo');
  }

  loadProfessionals(): void {
    // Cargar profesionales desde los usuarios con rol professional
    this.professionals = this.users.filter(user => user.role === 'professional')
      .map(user => ({
        id: user.professional?.id || user.id,
        name: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim(),
        specialty: user.professional?.specialty || 'General'
      }));
  }

  // Métodos para reportes
  generateReport(): void {
    const filters = { ...this.reportFilters };
    
    // Configurar fechas según el período
    const today = new Date();
    switch (filters.period) {
      case 'day':
        filters.startDate = today.toISOString().split('T')[0];
        filters.endDate = today.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        filters.startDate = weekStart.toISOString().split('T')[0];
        filters.endDate = weekEnd.toISOString().split('T')[0];
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        filters.startDate = monthStart.toISOString().split('T')[0];
        filters.endDate = monthEnd.toISOString().split('T')[0];
        break;
    }

    this.adminService.generateReport(filters).subscribe({
      next: (response) => {
        this.reportData = response.report;
        this.notificationService.success('Éxito', 'Reporte generado exitosamente');
      },
      error: (error) => {
        console.error('Error generando reporte:', error);
        this.notificationService.error('Error', 'No se pudo generar el reporte');
      }
    });
  }

  exportToPDF(): void {
    this.notificationService.success('Info', 'Exportación a PDF en desarrollo');
    // Implementar exportación a PDF
  }

  exportToExcel(): void {
    this.notificationService.success('Info', 'Exportación a Excel en desarrollo');
    // Implementar exportación a Excel
  }
}