import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  // Datos del formulario
  email = '';
  password = '';
  confirmPassword = '';
  firstName = '';
  lastName = '';
  dni = '';
  age: number | null = null;
  gender = '';
  address = '';
  phone = '';
  
  loading = false;
  error = '';
  success = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    console.log('=== INICIO REGISTRO ===');
    
    // Validaciones básicas
    if (!this.email || !this.password || !this.firstName || !this.lastName) {
      this.error = 'Email, contraseña, nombre y apellido son requeridos';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    if (this.password.length < 8) {
      this.error = 'La contraseña debe tener al menos 8 caracteres';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const userData = {
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      dni: this.dni || undefined,
      age: this.age || undefined,
      gender: this.gender || undefined,
      address: this.address || undefined,
      phone: this.phone || undefined
    };

    console.log('Datos a enviar:', userData);

    this.authService.register(userData).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        this.success = 'Usuario registrado exitosamente. Redirigiendo...';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error en registro:', error);
        this.error = error.error?.message || 'Error en el registro';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
