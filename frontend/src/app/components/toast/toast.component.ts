import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Toast } from '../../services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div 
        *ngFor="let toast of toasts" 
        class="toast"
        [class]="'toast-' + toast.type"
        (click)="removeToast(toast.id)">
        <div class="toast-icon">
          <span *ngIf="toast.type === 'success'">✅</span>
          <span *ngIf="toast.type === 'error'">❌</span>
          <span *ngIf="toast.type === 'warning'">⚠️</span>
          <span *ngIf="toast.type === 'info'">ℹ️</span>
        </div>
        <div class="toast-content">
          <h4>{{ toast.title }}</h4>
          <p>{{ toast.message }}</p>
        </div>
        <button class="toast-close" (click)="removeToast(toast.id)">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(10px);
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 300px;
      max-width: 400px;
      animation: slideIn 0.3s ease;
    }

    .toast:hover {
      transform: translateX(-5px);
    }

    .toast-success {
      background: linear-gradient(135deg, rgba(88, 214, 141, 0.9), rgba(72, 187, 120, 0.9));
      color: white;
    }

    .toast-error {
      background: linear-gradient(135deg, rgba(236, 112, 99, 0.9), rgba(231, 76, 60, 0.9));
      color: white;
    }

    .toast-warning {
      background: linear-gradient(135deg, rgba(247, 220, 111, 0.9), rgba(241, 196, 15, 0.9));
      color: #333;
    }

    .toast-info {
      background: linear-gradient(135deg, rgba(93, 173, 226, 0.9), rgba(52, 152, 219, 0.9));
      color: white;
    }

    .toast-icon {
      font-size: 20px;
    }

    .toast-content {
      flex: 1;
    }

    .toast-content h4 {
      margin: 0 0 4px 0;
      font-size: 14px;
      font-weight: 600;
    }

    .toast-content p {
      margin: 0;
      font-size: 13px;
      opacity: 0.9;
    }

    .toast-close {
      background: none;
      border: none;
      color: inherit;
      font-size: 18px;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.3s ease;
    }

    .toast-close:hover {
      opacity: 1;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .toast-container {
        top: 10px;
        right: 10px;
        left: 10px;
      }
      
      .toast {
        min-width: auto;
      }
    }
  `]
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  removeToast(id: string) {
    this.notificationService.removeToast(id);
  }
}