import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewService, Review, ReviewStats } from '../../services/review.service';
import { ProfessionalService } from '../../services/professional.service';

@Component({
  selector: 'app-public-professional-reviews',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reviews-container">
      <div class="header">
        <button class="btn-back" (click)="goBack()">← Volver</button>
        <h2>Reseñas de {{professionalName}}</h2>
      </div>

      <div class="stats-section" *ngIf="stats">
        <div class="stat-card">
          <h3>{{stats.averageRating}}</h3>
          <p>Calificación Promedio</p>
          <div class="stars">
            <span *ngFor="let star of getStars(stats.averageRating)">⭐</span>
          </div>
        </div>
        <div class="stat-card">
          <h3>{{stats.totalReviews}}</h3>
          <p>Total Reseñas</p>
        </div>
      </div>

      <div class="rating-distribution" *ngIf="stats && stats.totalReviews > 0">
        <h3>Distribución de Calificaciones</h3>
        <div *ngFor="let dist of stats.ratingDistribution.reverse()" class="rating-bar">
          <span class="rating-label">{{dist.rating}} ⭐</span>
          <div class="bar">
            <div class="fill" [style.width.%]="getPercentage(dist.count)"></div>
          </div>
          <span class="count">{{dist.count}}</span>
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
        <div *ngIf="reviews.length === 0 && !loading" class="no-reviews">
          <p>{{selectedRating ? 'No hay reseñas con esta calificación' : 'Este profesional aún no tiene reseñas'}}</p>
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
            <p *ngIf="!review.comment" class="no-comment">Sin comentario adicional</p>
          </div>
          <div class="review-footer">
            <span class="patient-name">{{review.patientName}}</span>
          </div>
        </div>
      </div>

      <div class="loading" *ngIf="loading">
        <p>Cargando reseñas...</p>
      </div>
    </div>
  `,
  styles: [`
    .reviews-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 30px;
    }

    .btn-back {
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-back:hover {
      background: var(--primary-dark);
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

    .stars {
      font-size: 1.2em;
      margin-top: 10px;
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
      gap: 15px;
      margin: 15px 0;
    }

    .rating-label {
      min-width: 60px;
      font-weight: 600;
    }

    .bar {
      flex: 1;
      height: 25px;
      background: #f0f0f0;
      border-radius: 12px;
      overflow: hidden;
    }

    .fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
      transition: width 0.5s ease;
    }

    .count {
      min-width: 30px;
      text-align: right;
      font-weight: 600;
      color: var(--text-secondary);
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
      margin-bottom: 15px;
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
      line-height: 1.6;
      color: var(--text-primary);
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
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(74, 144, 164, 0.1);
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: var(--text-secondary);
    }
  `]
})
export class PublicProfessionalReviewsComponent implements OnInit {
  reviews: Review[] = [];
  stats: ReviewStats | null = null;
  selectedRating: number | null = null;
  professionalId: number = 0;
  professionalName: string = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reviewService: ReviewService,
    private professionalService: ProfessionalService
  ) {}

  ngOnInit() {
    this.professionalId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProfessionalInfo();
    this.loadReviews();
  }

  loadProfessionalInfo() {
    this.professionalService.getProfessionalById(this.professionalId).subscribe({
      next: (response) => {
        this.professionalName = response.professional.name;
      },
      error: (error) => {
        console.error('Error cargando profesional:', error);
      }
    });
  }

  loadReviews() {
    this.loading = true;
    this.reviewService.getProfessionalReviews(this.professionalId, this.selectedRating || undefined).subscribe({
      next: (response) => {
        this.reviews = response.reviews;
        this.stats = response.stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando reseñas:', error);
        this.loading = false;
      }
    });
  }

  filterByRating(rating: number | null) {
    this.selectedRating = rating;
    this.loadReviews();
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getPercentage(count: number): number {
    return this.stats ? (count / this.stats.totalReviews) * 100 : 0;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-AR');
  }

  goBack() {
    this.router.navigate(['/app/find-professionals']);
  }
}