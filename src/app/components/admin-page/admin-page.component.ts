import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../service/api';

// Définition de l'interface pour les données d'inscription que nous attendons
export interface AdminRegistration {
  created_at: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone_number: string | null;
  event: {
    name: string;
    start_date: string;
  };
}

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {
  private apiService = inject(ApiService);

  // Signaux pour gérer l'état du composant
  password = signal('');
  isAuthenticated = signal(false);
  errorMessage = signal('');
  registrations = signal<AdminRegistration[]>([]);
  isLoading = signal(false);

  async checkPassword(): Promise<void> {
    // Ne fait rien si le mot de passe est vide
    if (!this.password()) {
      this.errorMessage.set('Veuillez entrer un mot de passe.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const data = await this.apiService.getAdminRegistrations(this.password());
      this.registrations.set(data);
      this.isAuthenticated.set(true);
    } catch (error: any) {
      this.errorMessage.set(
        error.status === 401 ? 'Mot de passe incorrect.' : 'Une erreur est survenue.'
      );
      this.isAuthenticated.set(false);
    } finally {
      this.isLoading.set(false);
    }
  }
}
