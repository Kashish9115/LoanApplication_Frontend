import { Routes } from '@angular/router';

export const routes: Routes = [



 {
    path: 'customer/dashboard',
    loadComponent: () =>
      import('./features/customer/pages/customer-dashboard/customer-dashboard')
        .then(m => m.CustomerDashboard)
  },

  {
    path: 'officer/dashboard',
    loadComponent: () =>
      import('./features/credit-officer/pages/credit-officer-dashboard/credit-officer-dashboard')
        .then(m => m.CreditOfficerDashboard)
  },

  {
    path: '',
    redirectTo: 'customer/dashboard',
    pathMatch: 'full'
  },

  {
    path: '**',
    redirectTo: 'customer/dashboard'
  }


];
