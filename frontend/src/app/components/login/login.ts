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
    console.log('=== INICIO LOGIN ===');
    console.log('Email:', this.email);
    console.log('Password length:', this.password.length);
    
    if (!this.email || !this.password) {
      this.error = 'Email y contraseña son requeridos';
      return;
    }

    this.loading = true;
    this.error = '';
    
    console.log('Enviando request a:', 'http://localhost:3000/api/auth/login');

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.error = error.error?.message || 'Error en el login';
        this.loading = false;
      },
      complete: () => {
        console.log('Login completado');
        this.loading = false;
      }
    });
  }
}
