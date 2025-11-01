import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'Agendarte - Sistema de Turnos';
  homeData: any = null;
  loading = true;
  error = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadHomeData();
  }

  loadHomeData() {
    this.apiService.getHomeData().subscribe({
      next: (data) => {
        this.homeData = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error conectando con el servidor';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }
}