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
    birthDate: '',
    address: '',
    specialty: '',
    subspecialty: '',
    licenseNumber: '',
    experience: '',
    education: '',
    description: '',
    consultationFee: '',
    socialNetworks: {
      facebook: '',
      instagram: '',
      linkedin: '',
      tiktok: '',
      website: ''
    },
    profileImage: null
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
      next: (response) => {
        const data = response.user;
        // Mapear datos del usuario, perfil y profesional
        this.profile = {
          firstName: data.profile?.firstName || '',
          lastName: data.profile?.lastName || '',
          email: data.email || '',
          phone: data.profile?.phone || '',
          birthDate: data.profile?.birthDate || '',
          address: data.profile?.address || '',
          specialty: data.professional?.specialty || '',
          subspecialty: data.professional?.subspecialty || '',
          licenseNumber: data.professional?.licenseNumber || '',
          experience: data.professional?.experience || data.professional?.yearsOfExperience || '',
          education: data.professional?.education || '',
          description: data.professional?.bio || '',
          consultationFee: data.professional?.consultationPrice || '',
          socialNetworks: data.professional?.socialNetworks || {
            facebook: '',
            instagram: '',
            linkedin: '',
            tiktok: '',
            website: ''
          },
          profileImage: data.professional?.profileImage || null
        };
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
    
    // Preparar datos para actualizar (excluir email)
    const updateData = {
      firstName: this.profile.firstName,
      lastName: this.profile.lastName,
      phone: this.profile.phone,
      birthDate: this.profile.birthDate,
      address: this.profile.address,
      specialty: this.profile.specialty,
      subspecialty: this.profile.subspecialty,
      licenseNumber: this.profile.licenseNumber,
      experience: this.profile.experience,
      yearsOfExperience: this.profile.experience,
      education: this.profile.education,
      bio: this.profile.description,
      consultationPrice: this.profile.consultationFee,
      socialNetworks: this.profile.socialNetworks,
      profileImage: this.profile.profileImage
    };
    
    this.authService.updateProfile(updateData).subscribe({
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

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profile.profileImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
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