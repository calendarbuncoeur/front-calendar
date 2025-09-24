import { Component, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../service/api';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

// Validateur personnalisé pour s'assurer qu'au moins un des deux champs est rempli
export const atLeastOne = (fields: string[]): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const atLeastOneFilled = fields.some(field => !!control.get(field)?.value);
    return atLeastOneFilled ? null : { atLeastOne: true };
  };
};

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule
  ],
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
      email: ['', Validators.email],
      phoneNumber: [''],
    }, { validators: atLeastOne(['email', 'phoneNumber']) })
  );
  public message = signal<string>('');
  public success = signal<boolean>(false);

  public eventUuid: string | null = null;

  constructor() {
    // On s'abonne aux changements de paramètres de la route pour récupérer l'UUID
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      // On utilise 'eventUuid' pour correspondre au nom du paramètre dans la route
      this.eventUuid = params.get('eventUuid');
    });
  }

  onSubmit(): void {
    if (this.registrationForm().valid) {
      const data = {
        ...this.registrationForm().value,
        // On envoie l'UUID de l'événement au backend
        eventUuid: this.eventUuid,
      };

      this.apiService
        .registerToEvent(data)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            this.message.set(response.message || 'Inscription réussie !');
            this.success.set(true);
            this.registrationForm().reset();
          },
          error: (error) => {
            // Gère l'erreur de conflit (email déjà inscrit)
            if (error.status === 409) {
              this.message.set("Cet e-mail ou numéro de téléphone est déjà inscrit pour cet événement.");
            } else {
              this.message.set(error.error?.error || "Échec de l'inscription. Veuillez réessayer.");
            }
            this.success.set(false);
          },
        });
    }
  }
}
