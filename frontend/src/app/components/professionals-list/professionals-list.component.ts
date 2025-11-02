import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfessionalService, Professional } from '../../services/professional.service';

@Component({
  selector: 'app-professionals-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './professionals-list.component.html',
  styleUrls: ['./professionals-list.component.css']
})
export class ProfessionalsListComponent implements OnInit {
  searchTerm = '';
  selectedSpecialty = '';
  sortBy = 'rating';
  minRating = 0;
  filteredProfessionals: Professional[] = [];
  professionals: Professional[] = [];
  favorites: number[] = [];
  loading = false;

  specialties = [
    'Cardiología', 'Dermatología', 'Neurología', 'Pediatría', 
    'Ginecología', 'Traumatología', 'Psiquiatría', 'Oftalmología'
  ];



  constructor(
    private router: Router,
    private professionalService: ProfessionalService
  ) {}

  ngOnInit() {
    this.loadFavorites();
    this.loadProfessionals();
  }

  loadProfessionals() {
    this.loading = true;
    this.professionalService.getAllProfessionals().subscribe({
      next: (response) => {
        this.professionals = response.professionals;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando profesionales:', error);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.professionals];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(prof => 
        prof.name.toLowerCase().includes(term) ||
        prof.specialty.toLowerCase().includes(term)
      );
    }

    if (this.selectedSpecialty) {
      filtered = filtered.filter(prof => prof.specialty === this.selectedSpecialty);
    }

    if (this.minRating > 0) {
      filtered = filtered.filter(prof => prof.rating >= this.minRating);
    }

    this.sortProfessionals(filtered);
    this.filteredProfessionals = filtered;
  }

  sortProfessionals(professionals: any[]) {
    professionals.sort((a, b) => {
      switch (this.sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return a.consultationPrice - b.consultationPrice;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }

  toggleFavorite(professionalId: number) {
    const index = this.favorites.indexOf(professionalId);
    if (index > -1) {
      this.favorites.splice(index, 1);
    } else {
      this.favorites.push(professionalId);
    }
    this.saveFavorites();
  }

  isFavorite(professionalId: number): boolean {
    return this.favorites.includes(professionalId);
  }

  viewProfile(professional: any) {
    console.log('Ver perfil de:', professional.name);
  }

  bookAppointment(professional: any) {
    console.log('Agendar cita con:', professional.name);
  }

  private loadFavorites() {
    const saved = localStorage.getItem('favorites');
    this.favorites = saved ? JSON.parse(saved) : [];
  }

  private saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(this.favorites));
  }

  goBack() {
    this.router.navigate(['/app/dashboard']);
  }
}