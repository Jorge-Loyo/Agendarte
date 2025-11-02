import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  get calculatedAge(): number | null {
    if (!this.profileData.birthDate) return null;
    const today = new Date();
    const birth = new Date(this.profileData.birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
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
        birthDate: this.currentUser.profile?.birthDate || '',
        gender: this.currentUser.profile?.gender || '',
        address: this.currentUser.profile?.address || '',
        profileImage: this.currentUser.profile?.profileImage || ''
      };
      this.imagePreview = this.profileData.profileImage || null;
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
    const reader = new FileReader();
    reader.onload = () => {
      this.profileData.profileImage = reader.result as string;
      this.sendProfileUpdate();
    };
    reader.readAsDataURL(this.selectedFile!);
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
    this.profileData.profileImage = '';
  }

  goBack() {
    this.router.navigate(['/app/dashboard']);
  }
}