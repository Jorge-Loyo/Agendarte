import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('token');
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  // Si ya hay usuario cargado
  const currentUser = authService.getCurrentUser();
  if (currentUser) {
    // Si es profesional intentando acceder al dashboard general, redirigir
    if (currentUser.role === 'professional' && state.url === '/app/dashboard') {
      router.navigate(['/app/professional-dashboard']);
      return false;
    }
    
    // Si es master intentando acceder al dashboard general, redirigir
    if (currentUser.role === 'master' && state.url === '/app/dashboard') {
      router.navigate(['/app/admin']);
      return false;
    }
    
    return true;
  }

  // Si no hay usuario pero hay token, esperar a que se cargue
  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user) {
        // Si es profesional intentando acceder al dashboard general, redirigir
        if (user.role === 'professional' && state.url === '/app/dashboard') {
          router.navigate(['/app/professional-dashboard']);
          return false;
        }
        
        // Si es master intentando acceder al dashboard general, redirigir
        if (user.role === 'master' && state.url === '/app/dashboard') {
          router.navigate(['/app/admin']);
          return false;
        }
        
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    })
  );
};