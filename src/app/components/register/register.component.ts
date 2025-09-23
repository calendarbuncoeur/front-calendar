import { Component, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../service/api';

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private destroyRef = inject(DestroyRef);

  public registrationForm = signal<FormGroup>(
    this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    })
  );
  public message = signal<string>('');
  public success = signal<boolean>(false);

  public eventId: string | null = null;

  constructor() {
    this.eventId = this.route.snapshot.paramMap.get('eventId');
  }

  onSubmit(): void {
    if (this.registrationForm().valid) {
      const data = {
        ...this.registrationForm().value,
        eventId: this.eventId,
      };

      this.apiService
        .registerToEvent(data)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            this.message.set(response.message || 'Inscription réussie !');
            this.success.set(true);
            this.registrationForm().reset();
            setTimeout(() => this.router.navigate(['/']), 3000);
          },
          error: (error) => {
            this.message.set(error.error?.error || "Échec de l'inscription. Veuillez réessayer.");
            this.success.set(false);
          },
        });
    }
  }
}
