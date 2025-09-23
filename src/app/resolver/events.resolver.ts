import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin, map, Observable, timer } from 'rxjs';
import { ApiService } from '../service/api';
import { Event } from '../models/event.model';

export const eventsResolver: ResolveFn<Event[]> = (): Observable<Event[]> => {
  const apiService = inject(ApiService);

  const events$ = apiService.getEvents();
  const timer$ = timer(1000); // Temps d'affichage minimum de 1 seconde

  return forkJoin([events$, timer$]).pipe(map(([events]) => events));
};
