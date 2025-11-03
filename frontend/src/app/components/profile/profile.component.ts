import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  editMode = false;
  loading = false;
  message = '';
  
  profileData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dni: '',
    birthDate: '',
    gender: '',
    address: '',
    profileImage: ''
  };

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  get calculatedAge(): number | null {
    return this.currentUser?.profile?.age || null;
  }

  getGenderDisplay(gender: string): string {
    const genderMap: { [key: string]: string } = {
      'M': 'Masculino',
      'F': 'Femenino', 
      'Other': 'Otro'
    };
    return genderMap[gender] || gender;
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/login']);
      } else {
        this.loadProfileData();
      }
    });
  }

  loadProfileData() {
    if (this.currentUser) {
      this.profileData = {
        firstName: this.currentUser.profile?.firstName || '',
        lastName: this.currentUser.profile?.lastName || '',
        email: this.currentUser.email || '',
        phone: this.currentUser.profile?.phone || '',
        dni: this.currentUser.profile?.dni || '',
        birthDate: '',
        gender: this.currentUser.profile?.gender || '',
        address: this.currentUser.profile?.address || '',
        profileImage: ''
      };
    }
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.loadProfileData(); // Resetear cambios si cancela
    }
    this.message = '';
  }

  onSubmit() {
    this.loading = true;
    this.message = '';
    
    if (this.selectedFile) {
      this.processImageAndUpdate();
    } else {
      this.sendProfileUpdate();
    }
  }

  private processImageAndUpdate() {
    // Por ahora omitir imagen hasta implementar almacenamiento
    this.sendProfileUpdate();
  }

  sendProfileUpdate() {
    this.authService.updateProfile(this.profileData).subscribe({
      next: (response) => {
        this.loading = false;
        this.editMode = false;
        this.message = 'Perfil actualizado correctamente';
        this.notificationService.success('Éxito', 'Perfil actualizado correctamente');
        console.log('Perfil actualizado:', response);
      },
      error: (error) => {
        this.loading = false;
        this.message = 'Error al actualizar el perfil';
        this.notificationService.error('Error', 'No se pudo actualizar el perfil');
        console.error('Error:', error);
      }
    });
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    this.selectedFile = file;
    this.createImagePreview(file);
  }

  private createImagePreview(file: File) {
    const reader = new FileReader();
    reader.onload = () => this.imagePreview = reader.result as string;
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  changePassword() {
    if (!this.passwordData.currentPassword || !this.passwordData.newPassword || !this.passwordData.confirmPassword) {
      this.notificationService.error('Error', 'Todos los campos de contraseña son requeridos');
      return;
    }
    
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.notificationService.error('Error', 'Las contraseñas no coinciden');
      return;
    }
    
    if (this.passwordData.newPassword.length < 8) {
      this.notificationService.error('Error', 'La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    this.authService.changePassword(this.passwordData.currentPassword, this.passwordData.newPassword).subscribe({
      next: () => {
        this.notificationService.success('Éxito', 'Contraseña actualizada correctamente');
        this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
      },
      error: (error: any) => {
        this.notificationService.error('Error', error.error?.message || 'Error al cambiar la contraseña');
      }
    });
  }

  goBack() {
    this.router.navigate(['/app/dashboard']);
  }
}