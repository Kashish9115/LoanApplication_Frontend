import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs';

import { EligibilityService } from '../../services/eligibility';
import { EligibilityResponse } from '../../models/eligibility.model';

@Component({
  selector: 'app-loan-eligibility',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loan-eligibility.html',
  styleUrl: './loan-eligibility.scss'
})
export class LoanEligibility {
  private readonly eligibilityService = inject(EligibilityService);
  private readonly cdr = inject(ChangeDetectorRef);

  customerId: number | null = null;
  result: EligibilityResponse | null = null;

  loading = false;
  errorMessage = '';

  viewResult(): void {
    if (this.loading) return;

    if (
      !this.customerId ||
      !Number.isInteger(this.customerId) ||
      this.customerId <= 0
    ) {
      this.errorMessage = 'Enter a valid Customer ID.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.result = null;

    this.eligibilityService
      .getLatestEligibility(this.customerId)
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
          } else {
            this.errorMessage =
              response.message || 'Eligibility result is not available.';
          }
          this.cdr.detectChanges();
        },
        error: error => {
          this.errorMessage =
            error?.error?.message ||
            'No saved eligibility result was found. Please contact your loan officer.';
          this.cdr.detectChanges();
        }
      });
  }
}