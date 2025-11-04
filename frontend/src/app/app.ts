import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './components/toast/toast.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('frontend');
  
  constructor(private authService: AuthService) {}
  
  ngOnInit() {
    // Forzar inicialización del AuthService
    console.log('🔧 Inicializando AuthService...');
    const token = localStorage.getItem('token');
    if (token) {
      console.log('✅ Token encontrado, verificando usuario...');
      this.authService.getProfile().subscribe({
        next: (response) => {
          console.log('✅ Usuario verificado:', response.user.email);
        },
        error: (error) => {
          console.log('❌ Token inválido, limpiando...');
          this.authService.logout();
        }
      });
    }
  }
}
