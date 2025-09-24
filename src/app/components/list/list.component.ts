import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { EventDetailDialogComponent } from '../event-detail-dialog/event-detail-dialog.component';
import {
  CalendarEvent,
  CalendarView,
  CalendarPreviousViewDirective,
  CalendarTodayDirective,
  CalendarNextViewDirective,
  CalendarMonthViewComponent,
  CalendarWeekViewComponent,
  CalendarDayViewComponent,
  CalendarDatePipe,
  provideCalendar,
  DateAdapter,
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { isSameDay, isSameMonth } from 'date-fns';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { Event } from '../../models/event.model';

const colors = {
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  green: {
    primary: '#28a745',
    secondary: '#d4edda',
  },
  orange: {
    primary: '#fd7e14',
    secondary: '#fff3cd',
  },
};

@Component({
  selector: 'app-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    CalendarPreviousViewDirective,
    CalendarTodayDirective,
    CalendarNextViewDirective,
    CalendarMonthViewComponent,
    CalendarWeekViewComponent,
    CalendarDayViewComponent,
    CalendarDatePipe,
  ],
  providers: [provideCalendar({ provide: DateAdapter, useFactory: adapterFactory })],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent {
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  public dialog = inject(MatDialog);

  public events = signal<Event[]>([]);
  public calendarEvents = signal<CalendarEvent[]>([]);

  // Propriétés du calendrier
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  activeDayIsOpen: boolean = false;
  refresh = new Subject<void>();

  // Mode d'affichage : 'list' ou 'calendar'
  displayMode = signal<'list' | 'calendar'>('list');

  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        const events = data['events'] as Event[];
        this.events.set(events);
        this.convertToCalendarEvents(events);
      },
    });
  }

  private convertToCalendarEvents(events: Event[]): void {
    const calendarEvents: CalendarEvent[] = events.map((event, index) => ({
      id: event.id,
      start: new Date(event.start_date),
      end: new Date(event.end_date),
      title: event.name,
      color: this.getEventColor(index),
      meta: {
        description: event.description,
        availableSlots: event.available_slots,
        uuid: event.uuid,
        registrations: event.registrations,
      },
      resizable: {
        beforeStart: false,
        afterEnd: false,
      },
      draggable: false,
    }));

    this.calendarEvents.set(calendarEvents);
  }

  private getEventColor(index: number) {
    const colorKeys = Object.keys(colors);
    const colorKey = colorKeys[index % colorKeys.length];
    return colors[colorKey as keyof typeof colors];
  }

  // Méthodes du calendrier
  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.dialog.open(EventDetailDialogComponent, {
      width: '500px',
      data: event,
    });
  }

  setView(view: CalendarView): void {
    this.view = view;
  }

  closeOpenMonthViewDay(): void {
    this.activeDayIsOpen = false;
  }

  toggleDisplayMode(): void {
    this.displayMode.set(this.displayMode() === 'list' ? 'calendar' : 'list');
  }
}
