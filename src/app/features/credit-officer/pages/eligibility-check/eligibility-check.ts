
import {
  Component,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs';

import { EligibilityService } from '../../../customer/services/eligibility';

import {
  EligibilityRequest,
  EligibilityResponse
} from '../../../customer/models/eligibility.model';

@Component({
  selector: 'app-eligibility-check',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './eligibility-check.html',
  styleUrl: './eligibility-check.scss'
})
export class EligibilityCheck {
  private readonly eligibilityService = inject(EligibilityService);
  private readonly cdr = inject(ChangeDetectorRef);

  request: EligibilityRequest = {
    customerId: 0,
    cibilScore: 800
  };

  result: EligibilityResponse | null = null;

  loading = false;
  errorMessage = '';
  successMessage = '';

  calculate(): void {
    if (this.loading) {
      return;
    }

    if (
      !Number.isInteger(Number(this.request.customerId)) ||
      Number(this.request.customerId) <= 0
    ) {
      this.errorMessage = 'Enter a valid Customer ID.';
      return;
    }

    if (
      !Number.isInteger(Number(this.request.cibilScore)) ||
      Number(this.request.cibilScore) < 300 ||
      Number(this.request.cibilScore) > 900
    ) {
      this.errorMessage = 'CIBIL score must be between 300 and 900.';
      return;
    }

    this.request.customerId = Number(this.request.customerId);
    this.request.cibilScore = Number(this.request.cibilScore);

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.result = null;

    this.eligibilityService
      .calculateEligibility(this.request)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: response => {
          if (response.success && response.data) {
            this.result = response.data;
            this.successMessage =
              response.message || 'Eligibility assessment saved.';
          } else {
            this.errorMessage =
              response.message || 'Eligibility calculation failed.';
          }

          this.cdr.detectChanges();
        },
        error: error => {
          this.errorMessage =
            error?.error?.message ||
            (error?.status === 0
              ? 'Unable to connect to the backend. Check the backend and CORS configuration.'
              : 'Unable to calculate eligibility. Check the backend response.');

          this.cdr.detectChanges();
        }
      });
  }

  reset(): void {
    if (this.loading) {
      return;
    }

    this.request = {
      customerId: 0,
      cibilScore: 800
    };

    this.result = null;
    this.errorMessage = '';
    this.successMessage = '';
  }
}
