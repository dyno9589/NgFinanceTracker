import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'holdings',
        loadComponent: () =>
          import('./features/holdings/holdings-list/holdings-list').then(m => m.HoldingsList)
      },
      {
        path: 'mutual-funds',
        loadComponent: () =>
          import('./features/mutual-funds/mf-list/mf-list').then(m => m.MfList)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];