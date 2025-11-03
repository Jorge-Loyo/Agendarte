import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.css']
})
export class AdminReportsComponent implements OnInit {
  stats = {
    totalUsers: 0,
    totalAppointments: 0,
    totalProfessionals: 0,
    totalPatients: 0,
    monthlyAppointments: 0,
    revenue: 0
  };

  constructor() {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    // Simular datos de estadísticas
    this.stats = {
      totalUsers: 156,
      totalAppointments: 342,
      totalProfessionals: 23,
      totalPatients: 128,
      monthlyAppointments: 89,
      revenue: 125000
    };
  }

  exportReport(type: string) {
    console.log('Exportando reporte:', type);
    // Implementar exportación
  }
}