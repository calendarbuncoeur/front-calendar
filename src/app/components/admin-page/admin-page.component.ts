import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../service/api';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';


// Définition de l'interface pour les données d'inscription que nous attendons
export interface AdminRegistration {
  created_at: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone_number: string | null;
  event: {
    id: number;
    name: string;
    start_date: string;
    available_slots: number;
  };
}

export interface GroupedRegistration {
  eventId: number;
  eventName: string;
  eventDate: string;
  availableSlots: number;
  registrations: Omit<AdminRegistration, 'event'>[];
}

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit {
  private apiService = inject(ApiService);

  // Signaux pour gérer l'état du composant
  password = signal('');
  isAuthenticated = signal(false);
  errorMessage = signal('');
  registrations = signal<GroupedRegistration[]>([]);
  isLoading = signal(false);
  isAuthenticating = signal(true); // Nouveau signal pour le chargement initial

  ngOnInit(): void {
    // Au chargement du composant, on tente de récupérer les données.
    // Si un cookie valide est présent, la requête réussira.
    this.fetchRegistrations();
  }

  private async fetchRegistrations(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      // On appelle l'API sans mot de passe. Le cookie est géré par le navigateur.
      const data = await this.apiService.getAdminRegistrations();
      this.isAuthenticated.set(true);
      this.groupRegistrations(data);
    } catch (error) {
      // Si la requête échoue (401), l'utilisateur n'est pas (ou plus) authentifié.
      this.isAuthenticated.set(false);
    } finally {
      this.isAuthenticating.set(false); // La vérification initiale est terminée
      this.isLoading.set(false);
    }
  }

  async login(): Promise<void> {
    // Ne fait rien si le mot de passe est vide
    if (!this.password()) {
      this.errorMessage.set('Veuillez entrer un mot de passe.');
      return;
    }

    this.isLoading.set(true); // Affiche le spinner sur le bouton
    this.errorMessage.set('');

    try {
      // 1. On s'authentifie auprès du backend pour obtenir le cookie
      await this.apiService.loginAdmin(this.password());
      // 2. Si le login réussit, on charge les données des inscrits
      await this.fetchRegistrations();
    } catch (error: any) {
      this.errorMessage.set(
        error.status === 401 ? 'Mot de passe incorrect.' : 'Une erreur est survenue.'
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  private groupRegistrations(regs: AdminRegistration[]): void {
    const grouped = regs.reduce((acc, reg) => {
      const eventId = reg.event.id;
      if (!acc[eventId]) {
        acc[eventId] = {
          eventId: eventId,
          eventName: reg.event.name,
          eventDate: reg.event.start_date,
          availableSlots: reg.event.available_slots,
          registrations: [],
        };
      }
      acc[eventId].registrations.push({
        created_at: reg.created_at,
        first_name: reg.first_name,
        last_name: reg.last_name,
        email: reg.email,
        phone_number: reg.phone_number,
      });
      return acc;
    }, {} as Record<number, GroupedRegistration>);

    this.registrations.set(Object.values(grouped));
  }
}
