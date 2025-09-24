import { Routes } from '@angular/router';
import { ListComponent } from './components/list/list.component';
import { RegisterComponent } from './components/register/register.component';
import { eventsResolver } from './resolver/events.resolver';
import { AdminPageComponent } from './components/admin-page/admin-page.component';

export const routes: Routes = [
  {
    path: '',
    component: ListComponent,
    resolve: {
      events: eventsResolver,
    },
  },
  {
    path: 'register/:eventId',
    component: RegisterComponent,
  },
  {
    path: 'admin-page',
    component: AdminPageComponent,
  },
  { path: '**', redirectTo: '' },
];
