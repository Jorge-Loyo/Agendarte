import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  appointmentId!: number;
  paymentData: any = null;
  loading = false;
  showSimulation = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.appointmentId = Number(this.route.snapshot.paramMap.get('id'));
    this.initializePayment();
  }

  initializePayment() {
    this.loading = true;
    this.paymentService.createPayment(this.appointmentId).subscribe({
      next: (response) => {
        this.paymentData = response;
        this.loading = false;
        
        // Mostrar simulación en desarrollo
        if (response.payment.init_point.includes('/payment/simulate')) {
          this.showSimulation = true;
        }
      },
      error: (error) => {
        this.notificationService.error('Error', error.error?.message || 'Error al crear el pago');
        this.loading = false;
        this.router.navigate(['/app/my-appointments']);
      }
    });
  }

  proceedToPayment() {
    if (this.paymentData?.payment?.init_point) {
      window.location.href = this.paymentData.payment.init_point;
    }
  }

  simulateSuccess() {
    this.loading = true;
    this.paymentService.simulatePaymentSuccess(this.appointmentId).subscribe({
      next: (response) => {
        this.notificationService.success('¡Pago exitoso!', 'Tu turno ha sido confirmado');
        this.router.navigate(['/app/my-appointments']);
      },
      error: (error) => {
        this.notificationService.error('Error', 'Error al procesar el pago');
        this.loading = false;
      }
    });
  }

  simulateFailure() {
    this.notificationService.error('Pago rechazado', 'El pago no pudo ser procesado');
    this.router.navigate(['/app/my-appointments']);
  }

  goBack() {
    this.router.navigate(['/app/my-appointments']);
  }
}