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

    // Validación de contraseña segura
    if (!this.isPasswordSecure(this.password)) {
      this.error = 'La contraseña debe tener al menos 8 caracteres, incluyendo: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial (@$!%*?&)';
      return;
    }

    // Validación de email
    if (!this.isEmailValid(this.email)) {
      this.error = 'Por favor ingresa un email válido';
      return;
    }

    // Validación de DNI (si se proporciona)
    if (this.dni && !this.isDniValid(this.dni)) {
      this.error = 'DNI debe tener entre 7 y 20 caracteres numéricos';
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
        console.error('=== ERROR COMPLETO ===', error);
        console.error('Error status:', error.status);
        console.error('Error error:', error.error);
        console.error('Error message:', error.error?.message);
        
        // Manejar errores específicos del backend
        if (error.error?.message) {
          this.error = error.error.message;
          console.log('Usando error.error.message:', this.error);
        } else if (error.error?.errors && Array.isArray(error.error.errors)) {
          // Errores de validación de Joi
          this.error = error.error.errors.join(', ');
          console.log('Usando error.error.errors:', this.error);
        } else {
          this.error = 'Error en el registro. Por favor intenta nuevamente.';
          console.log('Usando mensaje genérico:', this.error);
        }
        
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

  // Validación de contraseña segura
  isPasswordSecure(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  // Validación de email
  isEmailValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Obtener indicadores de fortaleza de contraseña
  getPasswordStrength(): string {
    if (!this.password) return '';
    
    let strength = 0;
    if (this.password.length >= 8) strength++;
    if (/[a-z]/.test(this.password)) strength++;
    if (/[A-Z]/.test(this.password)) strength++;
    if (/\d/.test(this.password)) strength++;
    if (/[@$!%*?&]/.test(this.password)) strength++;
    
    if (strength < 3) return 'Débil';
    if (strength < 5) return 'Media';
    return 'Fuerte';
  }

  getPasswordStrengthClass(): string {
    const strength = this.getPasswordStrength();
    if (strength === 'Débil') return 'weak';
    if (strength === 'Media') return 'medium';
    return 'strong';
  }

  // Validación de que las contraseñas coincidan
  passwordsMatch(): boolean {
    return this.password === this.confirmPassword;
  }

  // Validación de DNI
  isDniValid(dni: string): boolean {
    if (!dni) return true; // DNI es opcional
    const dniRegex = /^[0-9]{7,20}$/;
    return dniRegex.test(dni);
  }
}
