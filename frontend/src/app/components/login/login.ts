import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.email || !this.password) {
      this.error = 'Email y contraseña son requeridos';
      return;
    }

    if (this.password.length < 8) {
      this.error = 'La contraseña debe tener al menos 8 caracteres';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.email.toLowerCase(), this.password).subscribe({
      next: (response) => {
        this.router.navigate(['/app/dashboard']);
      },
      error: (error) => {
        console.error('Error completo:', error);
        this.error = error.error?.message || error.message || 'Error de conexión';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
