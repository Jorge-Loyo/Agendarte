import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  userProfile: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Suscribirse a cambios de autenticación
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.userProfile = user;
    });
  }

  loadUserProfile() {
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.userProfile = null;
    this.router.navigate(['/login']);
  }
}