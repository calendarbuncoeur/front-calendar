
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, Observable } from 'rxjs';
import { AdminRegistration } from '../models/admin.model';
import { Event } from '../models/event.model';

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
  getEvents(): Promise<Event[]> {
    return lastValueFrom(this.http.get<Event[]>(`${this.apiUrl}/events`));
  }

  /**
   * Enregistre un utilisateur à un événement.
   */
  registerToEvent(data: { eventUuid: string; firstName: string; lastName: string; email?: string; phoneNumber?: string; }): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(`${this.apiUrl}/register`, data);
  }

  /**
   * Tente de se connecter en tant qu'administrateur pour obtenir un cookie.
   * @param password Le mot de passe de l'administrateur.
   */
  loginAdmin(password: string): Promise<unknown> {
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

  // --- Méthodes de gestion des événements (Admin) ---

  createEvent(eventData: Partial<Event>): Promise<Event> {
    return lastValueFrom(
      this.http.post<Event>(`${this.apiUrl}/admin/events`, eventData, { withCredentials: true })
    );
  }

  updateEvent(uuid: string, eventData: Partial<Event>): Promise<Event> {
    return lastValueFrom(
      this.http.put<Event>(`${this.apiUrl}/admin/events/${uuid}`, eventData, { withCredentials: true })
    );
  }

  deleteEvent(uuid: string): Promise<unknown> {
    return lastValueFrom(
      this.http.delete(`${this.apiUrl}/admin/events/${uuid}`, { withCredentials: true })
    );
  }

  // --- Méthodes de gestion des inscriptions (Admin) ---

  deleteRegistration(id: number): Promise<unknown> {
    return lastValueFrom(
      this.http.delete(`${this.apiUrl}/admin/registrations/${id}`, { withCredentials: true })
    );
  }
}
