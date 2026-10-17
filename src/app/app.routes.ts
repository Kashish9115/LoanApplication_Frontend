
import { Routes } from '@angular/router';

export const routes: Routes = [

  // DEFAULT ROUTE
  {
    path: '',
    redirectTo: 'customer/dashboard',
    pathMatch: 'full'
  },

  // CUSTOMER ROUTES
  {
    path: 'customer',
    loadComponent: () =>
      import('./features/customer/layouts/customer-layout/customer-layout')
        .then(m => m.CustomerLayout),

    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/customer/pages/customer-dashboard/customer-dashboard')
            .then(m => m.CustomerDashboard)
      },
      {
        path: 'eligibility',
        loadComponent: () =>
          import('./features/customer/pages/loan-eligibility/loan-eligibility')
            .then(m => m.LoanEligibility)
      },
      {
        path: 'scorecard',
        loadComponent: () =>
          import('./features/customer/pages/scorecard-generation/scorecard-generation')
            .then(m => m.ScorecardGeneration)
      },
      {
        path: 'apply-loan',
        loadComponent: () =>
          import('./features/customer/pages/apply-loan/apply-loan')
            .then(m => m.ApplyLoan)
      }
    ]
  },

  // CREDIT OFFICER ROUTES
  {
    path: 'officer',
    loadComponent: () =>
      import('./features/credit-officer/layouts/officer-layout/officer-layout')
        .then(m => m.OfficerLayout),

    children: [
      // DEFAULT OFFICER ROUTE
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      // OFFICER DASHBOARD
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/credit-officer/pages/credit-officer-dashboard/credit-officer-dashboard')
            .then(m => m.CreditOfficerDashboard)
      },

      // MANUAL LOAN REVIEW
      {
        path: 'manual-review',
        loadComponent: () =>
          import('./features/credit-officer/pages/manual-review/manual-review')
            .then(m => m.ManualReview)
      },

      {
  path: 'eligibility',
  loadComponent: () =>
    import('./features/credit-officer/pages/eligibility-check/eligibility-check')
      .then(m => m.EligibilityCheck)
},


{
  path: 'officer',
  children: [
    // Keep your existing officer routes here.

    {
      path: 'manual-review',
      loadComponent: () =>
        import('./features/credit-officer/pages/manual-review/manual-review')
          .then(m => m.ManualReview)
    }
  ]
},

      // SANCTION LETTERS
      {
        path: 'sanctions',
        loadComponent: () =>
          import('./features/credit-officer/pages/sanction-letter/sanction-letter')
            .then(m => m.SanctionLetter)
      },

      // DISBURSEMENT PAGE COMPONENT
      {
        path: 'disbursements',
        loadComponent: () =>
          import('./features/credit-officer/pages/disbursement/disbursement')
            .then(m => m.Disbursement)
      },

      // LOAN ACCOUNTS
      {
        path: 'loan-accounts',
        loadComponent: () =>
          import('./features/credit-officer/pages/loan-account/loan-account')
            .then(m => m.LoanAccount)
      }
    ]
  },

  // UNKNOWN ROUTES - KEEP LAST
  {
    path: '**',
    redirectTo: 'customer/dashboard'
  }

];
