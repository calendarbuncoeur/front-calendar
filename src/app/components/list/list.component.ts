import { Component, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../service/api';

@Component({
  selector: 'app-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent {
  private apiService = inject(ApiService);
  private destroyRef = inject(DestroyRef);
  public events = signal<any[]>([]);

  constructor() {
    this.apiService.getEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any[]) => {
          this.events.set(data);
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des événements :', error);
        }
      });
  }
}
