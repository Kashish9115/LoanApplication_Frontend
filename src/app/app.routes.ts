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
    path: 'emi/schedule',
    loadComponent: () =>
      import('./features/emi/pages/emi-schedule/emi-schedule')
        .then(m => m.EmiSchedule)
  },





  {
path:'payment-historyofuser',
loadComponent:()=>import('./features/emi/pages/payment-history/payment-history').then(m=>m.PaymentHistory)



  },



{
  path:'admin/payment-history',
  loadComponent:()=>import('./features/emi/pages/admin-payment-history/admin-payment-history').then(m=>m.AdminPaymentHistory)
}
,


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
