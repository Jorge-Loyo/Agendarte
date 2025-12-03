import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PermissionsService, MenuOption } from '../../services/permissions.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  userProfile: any = null;
  private destroy$ = new Subject<void>();

  private roles = {
    'patient': 'Paciente',
    'professional': 'Profesional',
    'admin': 'Administrativo',
    'master': 'Master'
  };

  constructor(
    private authService: AuthService,
    private permissionsService: PermissionsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isLoggedIn = !!user;
        this.userProfile = user;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }



  getUserDisplayName(): string {
    if (this.userProfile?.profile?.firstName) {
      const lastName = this.userProfile.profile.lastName ? ` ${this.userProfile.profile.lastName}` : '';
      return `${this.userProfile.profile.firstName}${lastName}`;
    }
    return this.userProfile?.firstName || 'Usuario';
  }



  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.userProfile = null;
    this.router.navigate(['/login']);
  }
}