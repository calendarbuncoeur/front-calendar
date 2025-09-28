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
import { MatDialog } from '@angular/material/dialog';
import { EventDialogComponent } from '../event-dialog/event-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { Event, Registration } from '../../models/event.model';

interface AdminViewRegistration extends Registration {
  id: number;
  created_at: string;
  phone_number: string | null;
}

interface AdminViewEvent extends Omit<Event, 'registrations'> {
  registrations: AdminViewRegistration[];
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
    MatIconModule,
  ],
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit {
  private apiService = inject(ApiService);
  private dialog = inject(MatDialog);

  password = signal('');
  isAuthenticated = signal(false);
  errorMessage = signal('');
  events = signal<AdminViewEvent[]>([]);
  isLoading = signal(false);
  isAuthenticating = signal(true);

  ngOnInit(): void {
    this.loadInitialData();
  }

  private async loadInitialData(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      // getAdminRegistrations sert de vérification d'authentification
      const [eventsFromApi, adminRegistrations] = await Promise.all([
        this.apiService.getEvents(),
        this.apiService.getAdminRegistrations(),
      ]);

      this.isAuthenticated.set(true);

      const eventsMap = new Map<number, AdminViewEvent>();
      for (const event of eventsFromApi) {
        eventsMap.set(event.id, { ...event, registrations: [] });
      }

      for (const reg of adminRegistrations) {
        const event = eventsMap.get(reg.event.id);
        if (event) {
          event.registrations.push({
            id: reg.id,
            uuid: reg.uuid,
            created_at: reg.created_at,
            first_name: reg.first_name,
            last_name: reg.last_name,
            email: reg.email || '',
            phone_number: reg.phone_number,
          });
        }
      }

      this.events.set(Array.from(eventsMap.values()));

    } catch (error) {
      this.isAuthenticated.set(false);
    } finally {
      this.isAuthenticating.set(false);
      this.isLoading.set(false);
    }
  }

  async login(): Promise<void> {
    if (!this.password()) {
      this.errorMessage.set('Veuillez entrer un mot de passe.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await this.apiService.loginAdmin(this.password());
      await this.loadInitialData();
    } catch (error: any) {
      this.errorMessage.set(
        error.status === 401 ? 'Mot de passe incorrect.' : 'Une erreur est survenue.'
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  openEventDialog(event: AdminViewEvent | null = null): void {
    const dialogRef = this.dialog.open(EventDialogComponent, {
      width: '500px',
      data: { event },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (event && event.uuid) {
          this.updateEvent(event.uuid, result);
        } else {
          this.createEvent(result);
        }
      }
    });
  }

  async createEvent(eventData: Partial<Event>): Promise<void> {
    try {
      const newEvent = await this.apiService.createEvent(eventData);
      this.events.update(events => [{ ...newEvent, registrations: [] }, ...events]);
    } catch (error) {
      console.error('Error creating event', error);
    }
  }

  async updateEvent(uuid: string, eventData: Partial<Event>): Promise<void> {
    try {
      const updatedEvent = await this.apiService.updateEvent(uuid, eventData);
      this.events.update(events => {
        const index = events.findIndex((e) => e.uuid === uuid);
        if (index > -1) {
          const newEvents = [...events];
          newEvents[index] = { ...newEvents[index], ...updatedEvent } as AdminViewEvent;
          return newEvents;
        }
        return events;
      });
    } catch (error) {
      console.error('Error updating event', error);
    }
  }

  async deleteEvent(uuid: string): Promise<void> {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      try {
        await this.apiService.deleteEvent(uuid);
        this.events.update(events => events.filter((e) => e.uuid !== uuid));
      } catch (error) {
        console.error('Error deleting event', error);
      }
    }
  }

  async deleteRegistration(uuid: string): Promise<void> {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette inscription ?')) {
      try {
        await this.apiService.deleteRegistration(uuid);
        this.loadInitialData(); // Recharger pour mettre à jour les places, etc.
      } catch (error) {
        console.error('Error deleting registration', error);
      }
    }
  }
}
