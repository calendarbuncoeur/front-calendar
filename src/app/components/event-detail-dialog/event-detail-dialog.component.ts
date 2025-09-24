import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CalendarEvent } from 'angular-calendar';

@Component({
  selector: 'app-event-detail-dialog',
  standalone: true,
  imports: [CommonModule, RouterLink, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './event-detail-dialog.component.html',
})
export class EventDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EventDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CalendarEvent
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}

