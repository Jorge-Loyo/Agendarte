import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-professional-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './professional-profile.component.html',
  styleUrls: ['./professional-profile.component.css']
})
export class ProfessionalProfileComponent implements OnInit {
  profile: any = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: '',
    licenseNumber: '',
    experience: '',
    education: '',
    description: '',
    consultationFee: ''
  };

  isLoading = false;
  message = '';
  messageType = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.authService.getProfile().subscribe({
      next: (data) => {
        this.profile = { ...this.profile, ...data };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.showMessage('Error al cargar el perfil', 'error');
        this.isLoading = false;
      }
    });
  }

  updateProfile() {
    this.isLoading = true;
    this.authService.updateProfile(this.profile).subscribe({
      next: (response) => {
        this.showMessage('Perfil actualizado exitosamente', 'success');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.showMessage('Error al actualizar el perfil', 'error');
        this.isLoading = false;
      }
    });
  }

  private showMessage(text: string, type: string) {
    this.message = text;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 5000);
  }
}