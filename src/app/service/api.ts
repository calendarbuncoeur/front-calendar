
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, Observable } from 'rxjs';
import { AdminRegistration } from '../components/admin-page/admin-page.component';

// Interface pour la réponse de l'inscription
interface RegistrationResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = 'https://back-calendar.onrender.com/api';

  /**
   * Récupère la liste de tous les événements disponibles.
   */
  getEvents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/events`);
  }

  /**
   * Enregistre un utilisateur à un événement.
   */
  registerToEvent(data: any): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(`${this.apiUrl}/register`, data);
  }

  /**
   * Tente de se connecter en tant qu'administrateur pour obtenir un cookie.
   * @param password Le mot de passe de l'administrateur.
   */
  loginAdmin(password: string): Promise<any> {
    return lastValueFrom(
      this.http.post(
        `${this.apiUrl}/admin/login`,
        { password },
        {
          withCredentials: true, // Crucial: autorise l'envoi et la réception de cookies
        }
      )
    );
  }

  /**
   * Récupère toutes les inscriptions.
   * L'authentification est vérifiée par le backend via le cookie envoyé par le navigateur.
   */
  getAdminRegistrations(): Promise<AdminRegistration[]> {
    return lastValueFrom(
      this.http.get<AdminRegistration[]>(`${this.apiUrl}/admin/registrations`, {
        withCredentials: true, // Crucial: envoie le cookie d'authentification avec la requête
      })
    );
  }

  // Vous pouvez ajouter ici les autres méthodes pour gérer les événements, etc.
}
