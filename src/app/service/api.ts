import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';

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
   * @param data The user's registration data (name, email, eventUuid).
   * @returns An observable with the registration response.
   */
  registerToEvent(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  /**
   * Fetches all registrations for the admin.
   * @param password The admin password.
   * @returns A promise with the list of registrations.
   */
  getAdminRegistrations(password: string): Promise<any> {
    const headers = new HttpHeaders({
      'X-Admin-Password': password,
    });
    // Using firstValueFrom to convert the Observable to a Promise for async/await usage
    return firstValueFrom(this.http.get(`${this.apiUrl}/admin/registrations`, { headers: headers }));
  }
}
