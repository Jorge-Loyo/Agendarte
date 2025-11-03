import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  showSuccess(message: string) {
    console.log('✅ Success:', message);
    // Implementación simple para evitar errores
    alert(`✅ ${message}`);
  }

  showError(message: string) {
    console.log('❌ Error:', message);
    // Implementación simple para evitar errores
    alert(`❌ ${message}`);
  }

  showInfo(message: string) {
    console.log('ℹ️ Info:', message);
    alert(`ℹ️ ${message}`);
  }
}