import { Routes } from '@angular/router';
<<<<<<< HEAD

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


=======
import { MainLayout } from './core/theme/layouts/main-layout/main-layout';
import { ForeclosureDetails } from './features/foreclosure/pages/foreclosure-details/foreclosure-details';
export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: 'cibilscore',
        loadComponent: () =>
          import('./features/cibilscore/pages/cibilscore/cibilscore')
            .then(m => m.Cibilscore)
      },
      {
        path: '',
        redirectTo: 'cibilscore',
        pathMatch: 'full'
      },
      {
  path: 'foreclosure-request',
  loadComponent: () =>
    import('./features/foreclosure/pages/foreclosure-request/foreclosure-request')
      .then(m => m.ForeclosureRequest)
},{
  path: 'foreclosure-request',
  loadComponent: () =>
    import('./features/foreclosure/pages/foreclosure-request/foreclosure-request')
      .then(m => m.ForeclosureRequest)
},
{
  path: 'my-closure-list',
  loadComponent: () =>
    import('./features/foreclosure/pages/myforeclosure-list/myforeclosure-list')
      .then(m => m.MyforeclosureList)
},{
  path: 'foreclosure-details',
  loadComponent: () =>
    import('./features/foreclosure/pages/foreclosure-details/foreclosure-details')
      .then(m => m.ForeclosureDetails)
}
    ]
  }
>>>>>>> 54de678 (Add CIBIL score and foreclosure UI)
];
