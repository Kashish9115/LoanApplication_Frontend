
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ForeclosureService,
  ForeclosureRequest as ForeclosureRequestModel,
  LoanAccountDetails
} from '../../services/foreclosure';
import { finalize, timeout } from 'rxjs';
@Component({
  selector: 'app-foreclosure-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './foreclosure-request.html',
  styleUrl: './foreclosure-request.scss'
})
export class ForeclosureRequest implements OnInit {
  private readonly service = inject(ForeclosureService);

  customerId = 1;
  loanAccounts: number[] = [];
  selectedLoanId: number | null = null;
  loanDetails: LoanAccountDetails | null = null;
  requests: ForeclosureRequestModel[] = [];

  closureType: 'FULL' | 'PARTIAL' = 'FULL';
  months: number | null = null;
  expectedClosureDate = '';
  reason = '';

  loading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.loadActiveLoans();
    this.loadRequests();
  }

  loadActiveLoans(): void {
    this.service.getActiveLoanAccounts(this.customerId).subscribe({
      next: response => {
        this.loanAccounts = response.data ?? [];

        if (this.loanAccounts.length > 0) {
          this.selectedLoanId = this.loanAccounts[0];
          this.loadLoanDetails();
        }
      },
      error: () => {
        this.errorMessage = 'Unable to load active loan accounts.';
      }
    });
  }

  onLoanChange(): void {
    this.loanDetails = null;

    if (this.selectedLoanId !== null) {
      this.loadLoanDetails();
    }
  }

  loadLoanDetails(): void {
    if (this.selectedLoanId === null) return;

    this.service.getLoanAccountDetails(this.selectedLoanId).subscribe({
      next: response => {
        this.loanDetails = response.data;
      },
      error: () => {
        this.errorMessage = 'Unable to load loan details.';
      }
    });
  }

  loadRequests(): void {
    this.service.getCustomerRequests(this.customerId, 0, 5).subscribe({
      next: response => {
        this.requests = response.data ?? [];
      },
      error: () => {
        this.errorMessage = 'Unable to load foreclosure history.';
      }
    });
  }


submitRequest(): void {
  this.errorMessage = '';
  this.successMessage = '';

  if (this.selectedLoanId === null) {
    this.errorMessage = 'Please select a loan account.';
    return;
  }

  if (!this.expectedClosureDate) {
    this.errorMessage = 'Please select expected closure date.';
    return;
  }

  if (this.expectedClosureDate < this.today()) {
    this.errorMessage = 'Closure date cannot be in the past.';
    return;
  }

  if (
    this.closureType === 'PARTIAL' &&
    (!this.months || this.months <= 0)
  ) {
    this.errorMessage = 'Please enter valid number of months.';
    return;
  }

  this.loading = true;

  const loanId = this.selectedLoanId;

  const payload = {
    expectedClosureDate: this.expectedClosureDate,
    reason: this.reason
  };

  const request$ = this.closureType === 'FULL'
    ? this.service.submitFullClosure(loanId, payload)
    : this.service.submitPartialClosure(loanId, {
        ...payload,
        months: this.months!
      });

  console.log('Closure type:', this.closureType);
  console.log('Loan ID:', loanId);
  console.log('Request payload:', payload);

  request$.subscribe({
    next: response => {
      console.log('Backend response:', response);

      this.successMessage =
        response.message || 'Request submitted successfully.';

      this.loading = false;
      this.reason = '';
      this.months = null;

      this.loadRequests();
    },
    error: error => {
      console.error('Foreclosure API error:', error);

      this.errorMessage =
        error?.error?.message ||
        error?.message ||
        `Request failed. HTTP status: ${error?.status ?? 'unknown'}`;

      this.loading = false;
    }
  });
}
today(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

}
