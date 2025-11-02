import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { LayoutComponent } from './components/layout/layout.component';
import { HomeComponent } from './components/home/home.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  {
    path: 'app',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'appointments', loadComponent: () => import('./components/appointments/appointments.component').then(m => m.AppointmentsComponent) },
      { path: 'professionals', loadComponent: () => import('./components/professionals/professionals.component').then(m => m.ProfessionalsComponent) },
      { path: 'find-professionals', loadComponent: () => import('./components/professionals-list/professionals-list.component').then(m => m.ProfessionalsListComponent) },
      { path: 'my-appointments', loadComponent: () => import('./components/my-appointments/my-appointments.component').then(m => m.MyAppointmentsComponent) },
      { path: 'profile', loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'medical-history', loadComponent: () => import('./components/medical-history/medical-history.component').then(m => m.MedicalHistoryComponent) },
      { path: 'professional-dashboard', loadComponent: () => import('./components/professional-dashboard/professional-dashboard.component').then(m => m.ProfessionalDashboardComponent) }
    ]
  },
  { path: '**', redirectTo: '/home' }
];
