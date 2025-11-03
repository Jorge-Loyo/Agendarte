import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-specialties',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-specialties.component.html',
  styleUrls: ['./admin-specialties.component.css']
})
export class AdminSpecialtiesComponent implements OnInit {
  specialties: any[] = [];
  loading = false;
  showCreateForm = false;
  
  newSpecialty = {
    name: '',
    description: '',
    duration: 30,
    price: 0
  };

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadSpecialties();
  }

  loadSpecialties() {
    this.loading = true;
    this.adminService.getSpecialties().subscribe({
      next: (specialties: any) => {
        this.specialties = specialties;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading specialties:', error);
        this.loading = false;
      }
    });
  }

  createSpecialty() {
    this.adminService.createSpecialty(this.newSpecialty).subscribe({
      next: () => {
        this.loadSpecialties();
        this.resetForm();
        this.showCreateForm = false;
      },
      error: (error: any) => {
        console.error('Error creating specialty:', error);
      }
    });
  }

  resetForm() {
    this.newSpecialty = {
      name: '',
      description: '',
      duration: 30,
      price: 0
    };
  }

  editSpecialty(specialty: any) {
    // Implementar edición
  }

  deleteSpecialty(specialty: any) {
    if (confirm('¿Estás seguro de eliminar esta especialidad?')) {
      this.adminService.deleteSpecialty(specialty.id).subscribe({
        next: () => {
          this.loadSpecialties();
        },
        error: (error: any) => {
          console.error('Error deleting specialty:', error);
        }
      });
    }
  }
}