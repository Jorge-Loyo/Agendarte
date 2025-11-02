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
      { path: 'professional-calendar/:id', loadComponent: () => import('./components/professional-calendar/professional-calendar.component').then(m => m.ProfessionalCalendarComponent) },
      { path: 'my-appointments', loadComponent: () => import('./components/my-appointments/my-appointments.component').then(m => m.MyAppointmentsComponent) },
      { path: 'profile', loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'notification-preferences', loadComponent: () => import('./components/notification-preferences/notification-preferences.component').then(m => m.NotificationPreferencesComponent) },
      { path: 'medical-history', loadComponent: () => import('./components/medical-history/medical-history.component').then(m => m.MedicalHistoryComponent) },
      { path: 'professional-dashboard', loadComponent: () => import('./components/professional-dashboard/professional-dashboard.component').then(m => m.ProfessionalDashboardComponent) },
      { path: 'professional-appointment', loadComponent: () => import('./components/professional-appointment/professional-appointment.component').then(m => m.ProfessionalAppointmentComponent) },
      { path: 'schedule-config', loadComponent: () => import('./components/schedule-config/schedule-config.component').then(m => m.ScheduleConfigComponent) },
      { path: 'payment/:id', loadComponent: () => import('./components/payment/payment.component').then(m => m.PaymentComponent) },
      { 
        path: 'admin', 
        children: [
          { path: '', loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent) },
          { path: 'specialties', loadComponent: () => import('./components/admin/specialties/specialties.component').then(m => m.SpecialtiesComponent) }
        ]
      }
    ]
  },
  { path: '**', redirectTo: '/home' }
];
