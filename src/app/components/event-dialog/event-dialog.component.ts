
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-event-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
  ],
  templateUrl: './event-dialog.component.html',
})
export class EventDialogComponent implements OnInit {
  eventData: Partial<Event>;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;

  constructor(
    public dialogRef: MatDialogRef<EventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { event: Event | null }
  ) {
    this.eventData = data.event ? { ...data.event } : {
      name: '',
      description: '',
      available_slots: 10,
    };

    const start = data.event ? new Date(data.event.start_date) : new Date();
    const end = data.event ? new Date(data.event.end_date) : new Date();

    this.startDate = start;
    this.endDate = end;
    this.startTime = start.toTimeString().slice(0, 5);
    this.endTime = end.toTimeString().slice(0, 5);
  }

  ngOnInit(): void {}

  areDatesValid(): boolean {
    const startDateTime = this.getCombinedDateTime(this.startDate, this.startTime);
    const endDateTime = this.getCombinedDateTime(this.endDate, this.endTime);
    return startDateTime < endDateTime;
  }

  private getCombinedDateTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.eventData.start_date = this.getCombinedDateTime(this.startDate, this.startTime).toISOString();
    this.eventData.end_date = this.getCombinedDateTime(this.endDate, this.endTime).toISOString();
    this.dialogRef.close(this.eventData);
  }
}
