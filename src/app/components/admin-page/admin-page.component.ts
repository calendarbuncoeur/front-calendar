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
import { Event } from '../../models/event.model';

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
  events = signal<Event[]>([]);
  isLoading = signal(false);
  isAuthenticating = signal(true);

  ngOnInit(): void {
    this.loadInitialData();
  }

  private async loadInitialData(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      const events = await this.apiService.getEvents();
      this.events.set(events);
      this.isAuthenticated.set(true);
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

  openEventDialog(event: Event | null = null): void {
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
      this.events.set([newEvent, ...this.events()]);
    } catch (error) {
      console.error('Error creating event', error);
    }
  }

  async updateEvent(uuid: string, eventData: Partial<Event>): Promise<void> {
    try {
      const updatedEvent = await this.apiService.updateEvent(uuid, eventData);
      const index = this.events().findIndex((e) => e.uuid === uuid);
      if (index > -1) {
        const updatedEvents = [...this.events()];
        updatedEvents[index] = updatedEvent;
        this.events.set(updatedEvents);
      }
    } catch (error) {
      console.error('Error updating event', error);
    }
  }

  async deleteEvent(uuid: string): Promise<void> {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      try {
        await this.apiService.deleteEvent(uuid);
        this.events.set(this.events().filter((e) => e.uuid !== uuid));
      } catch (error) {
        console.error('Error deleting event', error);
      }
    }
  }

  async deleteRegistration(registrationId: number, eventUuid: string): Promise<void> {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette inscription ?')) {
      try {
        await this.apiService.deleteRegistration(registrationId);
        // Recharger les données pour mettre à jour le nombre de places, etc.
        this.loadInitialData();
      } catch (error) {
        console.error('Error deleting registration', error);
      }
    }
  }
}
