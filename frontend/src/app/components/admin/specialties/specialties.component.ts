import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpecialtyService, Specialty } from '../../../services/specialty.service';

@Component({
  selector: 'app-specialties',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './specialties.component.html',
  styleUrls: ['./specialties.component.css']
})
export class SpecialtiesComponent implements OnInit {
  specialties: Specialty[] = [];
  newSpecialty = { name: '', description: '' };
  editingSpecialty: Specialty | null = null;
  loading = false;

  constructor(private specialtyService: SpecialtyService) { }

  ngOnInit() {
    this.loadSpecialties();
  }

  loadSpecialties() {
    this.loading = true;
    this.specialtyService.getSpecialties().subscribe({
      next: (data) => {
        this.specialties = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando especialidades:', error);
        this.loading = false;
      }
    });
  }

  addSpecialty() {
    if (!this.newSpecialty.name.trim()) return;

    this.specialtyService.createSpecialty(this.newSpecialty).subscribe({
      next: () => {
        this.loadSpecialties();
        this.newSpecialty = { name: '', description: '' };
      },
      error: (error) => console.error('Error creando especialidad:', error)
    });
  }

  editSpecialty(specialty: Specialty) {
    this.editingSpecialty = { ...specialty };
  }

  updateSpecialty() {
    if (!this.editingSpecialty) return;

    this.specialtyService.updateSpecialty(this.editingSpecialty.id, this.editingSpecialty).subscribe({
      next: () => {
        this.loadSpecialties();
        this.editingSpecialty = null;
      },
      error: (error) => console.error('Error actualizando especialidad:', error)
    });
  }

  deleteSpecialty(id: number) {
    if (confirm('¿Estás seguro de eliminar esta especialidad?')) {
      this.specialtyService.deleteSpecialty(id).subscribe({
        next: () => this.loadSpecialties(),
        error: (error) => console.error('Error eliminando especialidad:', error)
      });
    }
  }

  cancelEdit() {
    this.editingSpecialty = null;
  }
}