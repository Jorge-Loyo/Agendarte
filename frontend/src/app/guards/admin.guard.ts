import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();
  
  if (user && (user.role === 'admin' || user.role === 'master')) {
    return true;
  } else {
    router.navigate(['/app/dashboard']);
    return false;
  }
};