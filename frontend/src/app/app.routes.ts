import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { LayoutComponent } from './components/layout/layout.component';
import { HomeComponent } from './components/home/home.component';
import { authGuard } from './guards/auth.guard';
import { permissionsGuard, adminPermissionsGuard, professionalPermissionsGuard } from './guards/permissions.guard';
import { AuthService } from './services/auth.service';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'callback', loadComponent: () => import('./components/google-callback/google-callback.component').then(m => m.GoogleCallbackComponent) },
  { path: 'google-auth', loadComponent: () => import('./components/google-auth/google-auth.component').then(m => m.GoogleAuthComponent) },

  {
    path: 'app',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { 
        path: 'dashboard', 
        loadComponent: () => import('./components/dashboard/dashboard').then(m => m.Dashboard),
        canActivate: [permissionsGuard],
        data: { requiredPermissions: ['dashboard_general'] }
      },
      { path: 'appointments', loadComponent: () => import('./components/appointments/appointments.component').then(m => m.AppointmentsComponent) },
      { path: 'professionals', loadComponent: () => import('./components/professionals/professionals.component').then(m => m.ProfessionalsComponent) },
      { 
        path: 'find-professionals', 
        loadComponent: () => import('./components/professionals-list/professionals-list.component').then(m => m.ProfessionalsListComponent),
        canActivate: [permissionsGuard],
        data: { requiredPermissions: ['view_professionals'], requiredRoles: ['patient'] }
      },
      { path: 'professional-calendar/:id', loadComponent: () => import('./components/professional-calendar/professional-calendar.component').then(m => m.ProfessionalCalendarComponent) },
      { 
        path: 'my-appointments', 
        loadComponent: () => import('./components/my-appointments/my-appointments.component').then(m => m.MyAppointmentsComponent),
        canActivate: [permissionsGuard],
        data: { requiredPermissions: ['view_appointments'] }
      },
      { path: 'leave-review', loadComponent: () => import('./components/leave-review/leave-review.component').then(m => m.LeaveReviewComponent) },
      { path: 'my-reviews', loadComponent: () => import('./components/professional-reviews/professional-reviews.component').then(m => m.ProfessionalReviewsComponent) },
      { path: 'profile', loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent) },
      { 
        path: 'professional-profile', 
        loadComponent: () => import('./components/professional-profile/professional-profile.component').then(m => m.ProfessionalProfileComponent),
        canActivate: [professionalPermissionsGuard],
        data: { requiredPermissions: ['view_profile'] }
      },
      { path: 'notification-preferences', loadComponent: () => import('./components/notification-preferences/notification-preferences.component').then(m => m.NotificationPreferencesComponent) },
      { path: 'permissions-demo', loadComponent: () => import('./components/permissions-demo/permissions-demo.component').then(m => m.PermissionsDemoComponent) },
      { path: 'medical-history', loadComponent: () => import('./components/medical-history/medical-history.component').then(m => m.MedicalHistoryComponent) },
      { 
        path: 'professional-dashboard', 
        loadComponent: () => import('./components/professional-dashboard/professional-dashboard.component').then(m => m.ProfessionalDashboardComponent),
        canActivate: [professionalPermissionsGuard],
        data: { requiredPermissions: ['professional_dashboard'] }
      },
      { path: 'professional-appointment', loadComponent: () => import('./components/professional-appointment/professional-appointment.component').then(m => m.ProfessionalAppointmentComponent) },
      { 
        path: 'schedule-config', 
        loadComponent: () => import('./components/schedule-config/schedule-config.component').then(m => m.ScheduleConfigComponent),
        canActivate: [professionalPermissionsGuard],
        data: { requiredPermissions: ['manage_schedule'] }
      },
      { 
        path: 'patient-history/:id', 
        loadComponent: () => import('./components/patient-history/patient-history.component').then(m => m.PatientHistoryComponent),
        canActivate: [professionalPermissionsGuard],
        data: { requiredPermissions: ['view_patient_history'] }
      },
      { 
        path: 'appointment-notes/:id', 
        loadComponent: () => import('./components/appointment-notes/appointment-notes.component').then(m => m.AppointmentNotesComponent),
        canActivate: [professionalPermissionsGuard],
        data: { requiredPermissions: ['add_notes'] }
      },
      { path: 'payment/:id', loadComponent: () => import('./components/payment/payment.component').then(m => m.PaymentComponent) },
      { path: 'professional-reviews/:id', loadComponent: () => import('./components/public-professional-reviews/public-professional-reviews.component').then(m => m.PublicProfessionalReviewsComponent) },
      { 
        path: 'professional-appointments', 
        loadComponent: () => import('./components/professional-appointments/professional-appointments.component').then(m => m.ProfessionalAppointmentsComponent),
        canActivate: [professionalPermissionsGuard],
        data: { requiredPermissions: ['manage_appointments'] }
      },
      { 
        path: 'meet-config', 
        loadComponent: () => import('./components/meet-config/meet-config.component').then(m => m.MeetConfigComponent),
        canActivate: [professionalPermissionsGuard],
        data: { requiredPermissions: ['professional_dashboard'] }
      },
      { 
        path: 'my-patients', 
        loadComponent: () => import('./components/professional-patients/professional-patients.component').then(m => m.ProfessionalPatientsComponent),
        canActivate: [professionalPermissionsGuard],
        data: { requiredPermissions: ['view_patient_history'] }
      },
      { 
        path: 'clinical-history', 
        loadComponent: () => import('./components/clinical-history/clinical-history.component').then(m => m.ClinicalHistoryComponent),
        canActivate: [professionalPermissionsGuard],
        data: { requiredPermissions: ['view_patient_history'] }
      },
      { 
        path: 'medical-record/:id', 
        loadComponent: () => import('./components/medical-record/medical-record.component').then(m => m.MedicalRecordComponent),
        canActivate: [professionalPermissionsGuard],
        data: { requiredPermissions: ['view_patient_history'] }
      },
      { 
        path: 'admin', 
        canActivate: [adminPermissionsGuard],
        children: [
          { path: '', loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent) },
          { path: 'users', loadComponent: () => import('./components/admin-users/admin-users.component').then(m => m.AdminUsersComponent) },
          { path: 'patients', loadComponent: () => import('./components/admin-patients/admin-patients.component').then(m => m.AdminPatientsComponent) },
          { path: 'appointments', loadComponent: () => import('./components/admin-appointments/admin-appointments.component').then(m => m.AdminAppointmentsComponent) },
          { path: 'specialties', loadComponent: () => import('./components/admin-specialties/admin-specialties.component').then(m => m.AdminSpecialtiesComponent) },
          { path: 'reports', loadComponent: () => import('./components/admin-reports/admin-reports.component').then(m => m.AdminReportsComponent) },
          { path: 'permissions', loadComponent: () => import('./components/admin-permissions/admin-permissions.component').then(m => m.AdminPermissionsComponent) }
        ]
      }
    ]
  },
  { path: '**', redirectTo: '/home' }
];
