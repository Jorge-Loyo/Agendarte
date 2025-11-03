import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService, AppointmentForReview } from '../../services/review.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-leave-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="review-container">
      <h2>📝 Dejar Reseña</h2>
      
      <div *ngIf="appointments.length === 0" class="no-appointments">
        <p>No tienes consultas completadas pendientes de reseñar.</p>
      </div>

      <div *ngFor="let appointment of appointments" class="appointment-card">
        <div class="appointment-info">
          <h3>{{appointment.professional.name}}</h3>
          <p>{{appointment.professional.specialty}}</p>
          <p>{{appointment.date}} - {{appointment.time}}</p>
        </div>

        <div class="review-form">
          <div class="rating-section">
            <label>Calificación:</label>
            <div class="stars">
              <span *ngFor="let star of [1,2,3,4,5]" 
                    class="star" 
                    [class.active]="star <= (selectedRatings[appointment.id] || 0)"
                    (click)="setRating(appointment.id, star)">
                ⭐
              </span>
            </div>
          </div>

          <div class="comment-section">
            <label>Comentario (opcional):</label>
            <textarea [(ngModel)]="comments[appointment.id]" 
                      placeholder="Comparte tu experiencia..."></textarea>
          </div>

          <div class="anonymous-section">
            <label>
              <input type="checkbox" [(ngModel)]="isAnonymous[appointment.id]">
              Reseña anónima
            </label>
          </div>

          <button class="submit-btn" 
                  [disabled]="!selectedRatings[appointment.id]"
                  (click)="submitReview(appointment)">
            Enviar Reseña
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .review-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .appointment-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 4px 20px rgba(74, 144, 164, 0.1);
      border: 1px solid var(--border-light);
    }

    .appointment-info h3 {
      color: var(--primary-color);
      margin-bottom: 5px;
    }

    .appointment-info p {
      color: var(--text-secondary);
      margin: 5px 0;
    }

    .review-form {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid var(--border-light);
    }

    .rating-section {
      margin-bottom: 15px;
    }

    .stars {
      display: flex;
      gap: 5px;
      margin-top: 5px;
    }

    .star {
      font-size: 24px;
      cursor: pointer;
      opacity: 0.3;
      transition: opacity 0.2s;
    }

    .star.active {
      opacity: 1;
    }

    .star:hover {
      opacity: 0.7;
    }

    .comment-section textarea {
      width: 100%;
      min-height: 80px;
      padding: 10px;
      border: 1px solid var(--border-light);
      border-radius: 8px;
      resize: vertical;
    }

    .anonymous-section {
      margin: 15px 0;
    }

    .submit-btn {
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .submit-btn:hover:not(:disabled) {
      background: var(--primary-dark);
    }

    .submit-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .no-appointments {
      text-align: center;
      padding: 40px;
      color: var(--text-secondary);
    }
  `]
})
export class LeaveReviewComponent implements OnInit {
  appointments: AppointmentForReview[] = [];
  selectedRatings: { [key: number]: number } = {};
  comments: { [key: number]: string } = {};
  isAnonymous: { [key: number]: boolean } = {};

  constructor(
    private reviewService: ReviewService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.reviewService.getAppointmentsForReview().subscribe({
      next: (response) => {
        this.appointments = response.appointments;
      },
      error: (error) => {
        this.toastService.showError('Error cargando citas');
      }
    });
  }

  setRating(appointmentId: number, rating: number) {
    this.selectedRatings[appointmentId] = rating;
  }

  submitReview(appointment: AppointmentForReview) {
    const reviewData = {
      appointmentId: appointment.id,
      rating: this.selectedRatings[appointment.id],
      comment: this.comments[appointment.id] || '',
      isAnonymous: this.isAnonymous[appointment.id] || false
    };

    this.reviewService.createReview(reviewData).subscribe({
      next: () => {
        this.toastService.showSuccess('Reseña enviada exitosamente');
        this.loadAppointments();
      },
      error: (error) => {
        this.toastService.showError('Error enviando reseña');
      }
    });
  }
}