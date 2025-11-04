import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f8fafc;">
      <div style="text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="font-size: 3rem; margin-bottom: 20px;">📅</div>
        <h2>Conectando con Google Calendar...</h2>
        <p>Procesando autorización, por favor espera.</p>
      </div>
    </div>
  `
})
export class GoogleCallbackComponent implements OnInit {
  
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const state = params['state'];
      
      if (code) {
        this.processCallback(code, state);
      } else {
        this.router.navigate(['/app/professional-dashboard'], { 
          queryParams: { error: 'authorization_failed' } 
        });
      }
    });
  }

  async processCallback(code: string, state: string) {
    try {
      const response = await fetch(`http://localhost:3000/api/google-calendar/callback?code=${code}&state=${state}`);
      
      if (response.ok) {
        this.router.navigate(['/app/professional-dashboard'], { 
          queryParams: { calendar: 'connected' } 
        });
      } else {
        throw new Error('Error procesando callback');
      }
    } catch (error) {
      console.error('Error en callback:', error);
      this.router.navigate(['/app/professional-dashboard'], { 
        queryParams: { error: 'callback_failed' } 
      });
    }
  }
}