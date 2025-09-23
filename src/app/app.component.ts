import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterOutlet,
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  RouterLink,
} from '@angular/router';
import { filter } from 'rxjs';
import { LoadingComponent } from './components/loading/loading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LoadingComponent, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected readonly title = signal('front-calendar');

  isLoading = true;
  private router = inject(Router);

  constructor() {
    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError
        )
      )
      .subscribe((event) => {
        this.isLoading = event instanceof NavigationStart;
      });
  }
}
