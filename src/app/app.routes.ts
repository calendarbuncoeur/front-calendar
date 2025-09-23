import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { ListComponent } from './components/list/list.component';

export const routes: Routes = [
  // Route de base qui affiche la liste des événements
  { path: '', component: ListComponent },

  // Route pour la page d'inscription, avec un paramètre dynamique pour l'ID de l'événement
  { path: 'register/:eventId', component: RegisterComponent },

  // Redirection vers la page d'accueil si l'URL ne correspond à aucune route
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
