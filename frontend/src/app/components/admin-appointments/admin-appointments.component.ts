import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { ProfessionalService } from '../../services/professional.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-appointments.component.html',
  styleUrls: ['./admin-appointments.component.css']
})
export class AdminAppointmentsComponent implements OnInit {
  appointments: any[] = [];
  professionals: any[] = [];
  filteredAppointments: any[] = [];
  
  searchTerm = '';
  selectedProfessional = '';
  selectedStatus = '';
  selectedDate = '';
  
  showModal = false;
  selectedAppointment: any = null;
  modalAction = '';
  
  newAppointment = {
    patientSearch: '',
    professionalId: '',
    date: '',
    time: '',
    notes: ''
  };
  
  patients: any[] = [];
  showPatientResults = false;
  selectedPatient: any = null;

  constructor(
    private adminService: AdminService,
    private professionalService: ProfessionalService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadAppointments();
    this.loadProfessionals();
  }

  async loadAppointments() {
    try {
      const response = await this.adminService.getAllAppointments().toPromise();
      this.appointments = response.appointments || [];
      this.filteredAppointments = [...this.appointments];
    } catch (error) {
      this.toastService.showError('Error cargando turnos');
    }
  }

  async loadProfessionals() {
    try {
      const response = await this.professionalService.getAllProfessionals().toPromise();
      this.professionals = response.professionals || [];
    } catch (error) {
      this.toastService.showError('Error cargando profesionales');
    }
  }

  applyFilters() {
    this.filteredAppointments = this.appointments.filter(apt => {
      const matchesSearch = !this.searchTerm || 
        apt.patient?.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        apt.professional?.name?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesProfessional = !this.selectedProfessional || 
        apt.professionalId == this.selectedProfessional;
      
      const matchesStatus = !this.selectedStatus || apt.status === this.selectedStatus;
      
      const matchesDate = !this.selectedDate || apt.appointmentDate === this.selectedDate;
      
      return matchesSearch && matchesProfessional && matchesStatus && matchesDate;
    });
  }

  openModal(action: string, appointment?: any) {
    this.modalAction = action;
    this.selectedAppointment = appointment;
    this.showModal = true;
    
    if (action === 'create') {
      this.resetNewAppointment();
    }
  }

  closeModal() {
    this.showModal = false;
    this.selectedAppointment = null;
    this.showPatientResults = false;
  }

  resetNewAppointment() {
    this.newAppointment = {
      patientSearch: '',
      professionalId: '',
      date: '',
      time: '',
      notes: ''
    };
    this.patients = [];
  }

  async searchPatients() {
    if (this.newAppointment.patientSearch.length < 2) {
      this.patients = [];
      this.showPatientResults = false;
      return;
    }

    try {
      const response = await this.adminService.searchPatients(this.newAppointment.patientSearch).toPromise();
      this.patients = response.patients || [];
      this.showPatientResults = true;
    } catch (error) {
      this.toastService.showError('Error buscando pacientes');
    }
  }

  selectPatient(patient: any) {
    this.newAppointment.patientSearch = `${patient.firstName} ${patient.lastName} - ${patient.dni}`;
    this.selectedPatient = patient;
    this.showPatientResults = false;
  }

  async createAppointment() {
    if (!this.selectedPatient || !this.newAppointment.professionalId || 
        !this.newAppointment.date || !this.newAppointment.time) {
      this.toastService.showError('Complete todos los campos requeridos');
      return;
    }

    try {
      await this.adminService.createAppointment({
        patientId: this.selectedPatient.id,
        professionalId: this.newAppointment.professionalId,
        date: this.newAppointment.date,
        time: this.newAppointment.time,
        notes: this.newAppointment.notes
      }).toPromise();

      this.toastService.showSuccess('Turno creado exitosamente');
      this.closeModal();
      this.loadAppointments();
    } catch (error: any) {
      this.toastService.showError(error.error?.message || 'Error creando turno');
    }
  }

  async cancelAppointment() {
    if (!this.selectedAppointment) return;

    try {
      await this.adminService.cancelAppointment(this.selectedAppointment.id, {
        reason: 'Cancelado por administrador'
      }).toPromise();

      this.toastService.showSuccess('Turno cancelado exitosamente');
      this.closeModal();
      this.loadAppointments();
    } catch (error: any) {
      this.toastService.showError(error.error?.message || 'Error cancelando turno');
    }
  }

  async processPayment(appointmentId: number) {
    try {
      await this.adminService.processPayment(appointmentId).toPromise();
      this.toastService.showSuccess('Pago procesado exitosamente');
      this.loadAppointments();
    } catch (error: any) {
      this.toastService.showError(error.error?.message || 'Error procesando pago');
    }
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'scheduled': 'status-scheduled',
      'confirmed': 'status-confirmed',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    };
    return classes[status] || '';
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'scheduled': 'Programado',
      'confirmed': 'Confirmado',
      'completed': 'Completado',
      'cancelled': 'Cancelado'
    };
    return texts[status] || status;
  }

  getPaymentStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'payment-pending',
      'paid': 'payment-paid',
      'refunded': 'payment-refunded'
    };
    return classes[status] || '';
  }

  getPaymentStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'pending': 'Pendiente',
      'paid': 'Pagado',
      'refunded': 'Reembolsado'
    };
    return texts[status] || status;
  }
}