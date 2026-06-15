import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'holdings',
        loadComponent: () =>
          import('./features/holdings/holdings-list/holdings-list.component').then(m => m.HoldingsListComponent)
      },
      {
        path: 'mutual-funds',
        loadComponent: () =>
          import('./features/mutual-funds/mf-list/mf-list.component').then(m => m.MfListComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];