import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../service/api';

export interface Event {
    id: number;
    uuid: string;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    available_slots: number;
    registrations: Registration[];
}

export interface Registration {
    uuid: string;
    first_name: string;
    last_name: string;
    email: string;
}

@Component({
  selector: 'app-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent {
  private apiService = inject(ApiService);
  private destroyRef = inject(DestroyRef);
  public events = signal<Event[]>([]);

  constructor() {
    this.apiService
      .getEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: Event[]) => {
          this.events.set(data);
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des événements :', error);
        },
      });
  }
}
