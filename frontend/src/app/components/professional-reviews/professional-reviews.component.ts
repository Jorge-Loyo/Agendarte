import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService, Review, ReviewStats } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-professional-reviews',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reviews-container">
      <h2>⭐ Mis Reseñas</h2>

      <div class="stats-section" *ngIf="stats">
        <div class="stat-card">
          <h3>{{stats.averageRating}}</h3>
          <p>Calificación Promedio</p>
        </div>
        <div class="stat-card">
          <h3>{{stats.totalReviews}}</h3>
          <p>Total Reseñas</p>
        </div>
      </div>

      <div class="rating-distribution" *ngIf="stats">
        <h3>Distribución de Calificaciones</h3>
        <div *ngFor="let dist of stats.ratingDistribution" class="rating-bar">
          <span>{{dist.rating}} ⭐</span>
          <div class="bar">
            <div class="fill" [style.width.%]="getPercentage(dist.count)"></div>
          </div>
          <span>{{dist.count}}</span>
        </div>
      </div>

      <div class="filters">
        <button *ngFor="let rating of [null, 5, 4, 3, 2, 1]" 
                class="filter-btn"
                [class.active]="selectedRating === rating"
                (click)="filterByRating(rating)">
          {{rating ? rating + ' ⭐' : 'Todas'}}
        </button>
      </div>

      <div class="reviews-list">
        <div *ngIf="reviews.length === 0" class="no-reviews">
          <p>No tienes reseñas aún.</p>
        </div>

        <div *ngFor="let review of reviews" class="review-card">
          <div class="review-header">
            <div class="rating">
              <span *ngFor="let star of getStars(review.rating)">⭐</span>
            </div>
            <span class="date">{{formatDate(review.createdAt)}}</span>
          </div>
          <div class="review-content">
            <p *ngIf="review.comment">{{review.comment}}</p>
            <p *ngIf="!review.comment" class="no-comment">Sin comentario</p>
          </div>
          <div class="review-footer">
            <span class="patient-name">{{review.patientName}}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reviews-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(74, 144, 164, 0.1);
    }

    .stat-card h3 {
      font-size: 2em;
      color: var(--primary-color);
      margin-bottom: 5px;
    }

    .rating-distribution {
      background: white;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      box-shadow: 0 4px 20px rgba(74, 144, 164, 0.1);
    }

    .rating-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 10px 0;
    }

    .bar {
      flex: 1;
      height: 20px;
      background: #f0f0f0;
      border-radius: 10px;
      overflow: hidden;
    }

    .fill {
      height: 100%;
      background: var(--primary-color);
      transition: width 0.3s;
    }

    .filters {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 8px 16px;
      border: 1px solid var(--border-light);
      background: white;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .filter-btn.active {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    .review-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 15px;
      box-shadow: 0 4px 20px rgba(74, 144, 164, 0.1);
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .rating {
      font-size: 18px;
    }

    .date {
      color: var(--text-secondary);
      font-size: 0.9em;
    }

    .review-content p {
      margin: 10px 0;
      line-height: 1.5;
    }

    .no-comment {
      color: var(--text-secondary);
      font-style: italic;
    }

    .review-footer {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid var(--border-light);
    }

    .patient-name {
      font-weight: 500;
      color: var(--primary-color);
    }

    .no-reviews {
      text-align: center;
      padding: 40px;
      color: var(--text-secondary);
    }
  `]
})
export class ProfessionalReviewsComponent implements OnInit {
  reviews: Review[] = [];
  stats: ReviewStats | null = null;
  selectedRating: number | null = null;
  professionalId: number = 0;

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user?.role === 'professional') {
      // Obtener ID del profesional desde el backend
      this.loadProfessionalId();
    }
  }

  loadProfessionalId() {
    // Obtener el perfil completo para conseguir el ID del profesional
    this.authService.getProfile().subscribe({
      next: (response) => {
        if (response.user?.professional?.id) {
          this.professionalId = response.user.professional.id;
          this.loadReviews();
        } else {
          // Si no tiene registro profesional, crear uno temporal
          this.professionalId = response.user.id;
          this.loadReviews();
        }
      },
      error: (error) => {
        this.toastService.showError('Error obteniendo perfil');
      }
    });
  }

  loadReviews() {
    if (!this.professionalId) return;
    
    this.reviewService.getProfessionalReviews(this.professionalId, this.selectedRating || undefined).subscribe({
      next: (response) => {
        this.reviews = response.reviews;
        this.stats = response.stats;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.toastService.showError('Error cargando reseñas');
        // Mostrar datos vacíos en caso de error
        this.reviews = [];
        this.stats = {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: [1,2,3,4,5].map(rating => ({ rating, count: 0 }))
        };
      }
    });
  }

  filterByRating(rating: number | null) {
    this.selectedRating = rating;
    this.loadReviews();
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getPercentage(count: number): number {
    return this.stats ? (count / this.stats.totalReviews) * 100 : 0;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-AR');
  }
}