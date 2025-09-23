import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = 'https://back-calendar.onrender.com/api';

  /**
   * Fetches the list of all available events.
   * @returns An observable with the list of events.
   */
  getEvents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/events`);
  }

  /**
   * Registers a new user for a specific event.
   * @param data The user's registration data (name, email, eventId).
   * @returns An observable with the registration response.
   */
  registerToEvent(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }
}
