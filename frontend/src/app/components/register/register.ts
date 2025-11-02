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
  fieldErrors: { [key: string]: string } = {};
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.validateForm()) {
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
        if (error.error?.field) {
          this.fieldErrors[error.error.field] = error.error.message;
        } else if (error.error?.errors && Array.isArray(error.error.errors)) {
          this.error = error.error.errors.join(', ');
        } else {
          this.error = error.error?.message || 'Error en el registro';
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

  validateForm(): boolean {
    let isValid = true;
    this.fieldErrors = {};

    if (!this.firstName.trim()) {
      this.fieldErrors['firstName'] = 'Nombre es requerido';
      isValid = false;
    }

    if (!this.lastName.trim()) {
      this.fieldErrors['lastName'] = 'Apellido es requerido';
      isValid = false;
    }

    if (!this.email.trim()) {
      this.fieldErrors['email'] = 'Email es requerido';
      isValid = false;
    } else if (!this.isEmailValid(this.email)) {
      this.fieldErrors['email'] = 'Email inválido';
      isValid = false;
    }

    if (!this.dni.trim()) {
      this.fieldErrors['dni'] = 'DNI es requerido';
      isValid = false;
    } else if (!this.isDniValid(this.dni)) {
      this.fieldErrors['dni'] = 'DNI debe tener entre 7 y 20 dígitos';
      isValid = false;
    }

    if (!this.password) {
      this.fieldErrors['password'] = 'Contraseña es requerida';
      isValid = false;
    } else if (!this.isPasswordSecure(this.password)) {
      this.fieldErrors['password'] = 'Contraseña debe tener 8+ caracteres, mayúscula, minúscula y número';
      isValid = false;
    }

    if (!this.confirmPassword) {
      this.fieldErrors['confirmPassword'] = 'Confirmar contraseña es requerido';
      isValid = false;
    } else if (this.password !== this.confirmPassword) {
      this.fieldErrors['confirmPassword'] = 'Las contraseñas no coinciden';
      isValid = false;
    }

    return isValid;
  }

  getFieldError(field: string): string {
    return this.fieldErrors[field] || '';
  }

  hasFieldError(field: string): boolean {
    return !!this.fieldErrors[field];
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  isDniValid(dni: string): boolean {
    const dniRegex = /^[0-9]{7,20}$/;
    return dniRegex.test(dni);
  }
}
