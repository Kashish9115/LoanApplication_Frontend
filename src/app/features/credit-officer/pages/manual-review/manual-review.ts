import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs';

import {
  ManualReview as ManualReviewService,
  ManualReviewDeal
} from '../../services/manual-review';

@Component({
  selector: 'app-manual-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manual-review.html',
  styleUrl: './manual-review.scss'
})
export class ManualReview implements OnInit {
  private readonly reviewService = inject(ManualReviewService);
  private readonly cdr = inject(ChangeDetectorRef);

  // Temporary testing officer ID.
  private readonly testOfficerId = 1;

  deals: ManualReviewDeal[] = [];
  selectedDeal: ManualReviewDeal | null = null;

  loading = false;
  submitting = false;

  errorMessage = '';
  successMessage = '';

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  ngOnInit(): void {
    this.loadManualReviewDeals();
  }

  loadManualReviewDeals(): void {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.reviewService
      .getManualReviewDeals(this.currentPage, this.pageSize)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: response => {
          if (response?.success && response.data) {
            this.deals = response.data.content ?? [];
            this.totalElements = response.data.totalElements ?? 0;
            this.totalPages = response.data.totalPages ?? 0;

            if (
              this.deals.length === 0 &&
              this.currentPage > 0 &&
              this.currentPage >= this.totalPages
            ) {
              this.currentPage = Math.max(0, this.totalPages - 1);
              this.loading = false;
              this.cdr.markForCheck();
              this.loadManualReviewDeals();
              return;
            }
          } else {
            this.deals = [];
            this.totalElements = 0;
            this.totalPages = 0;
            this.errorMessage =
              response?.message ||
              'Unable to load pending applications.';
          }

          this.cdr.markForCheck();
        },
        error: error => {
          this.errorMessage =
            error?.name === 'TimeoutError'
              ? 'The request timed out. Check the backend and try again.'
              : error?.error?.message ||
                error?.message ||
                'Failed to load pending loan applications.';

          this.cdr.markForCheck();
        }
      });
  }

  refreshApplications(): void {
    if (this.loading || this.submitting) {
      return;
    }

    this.currentPage = 0;
    this.successMessage = '';
    this.loadManualReviewDeals();
  }

  viewDeal(deal: ManualReviewDeal): void {
    this.selectedDeal = deal;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();
  }

  closeDetails(): void {
    if (this.submitting) {
      return;
    }

    this.selectedDeal = null;
    this.cdr.markForCheck();
  }

  approveDeal(): void {
    this.submitDecision('APPROVED');
  }

  rejectDeal(): void {
    this.submitDecision('REJECTED');
  }

  private submitDecision(
    status: 'APPROVED' | 'REJECTED'
  ): void {
    if (!this.selectedDeal || this.submitting) {
      return;
    }

    const dealId = this.selectedDeal.dealId;

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    this.reviewService
      .reviewLoanDeal({
        dealId,
        officerId: this.testOfficerId,
        status
      })
      .pipe(
        timeout(15000),
        finalize(() => {
          this.submitting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: response => {
          if (response?.success) {
            this.successMessage =
              response.message ||
              `Loan application ${status.toLowerCase()} successfully.`;

            this.selectedDeal = null;
            this.currentPage = 0;

            // Refresh after the submitting flag is reset.
            this.submitting = false;
            this.loadManualReviewDeals();
          } else {
            this.errorMessage =
              response?.message ||
              'Unable to submit loan review.';
          }

          this.cdr.markForCheck();
        },
        error: error => {
          this.errorMessage =
            error?.name === 'TimeoutError'
              ? 'Review request timed out. Check the backend before retrying.'
              : error?.error?.message ||
                error?.message ||
                'Failed to submit loan review.';

          this.cdr.markForCheck();
        }
      });
  }

  previousPage(): void {
    if (
      this.currentPage > 0 &&
      !this.loading &&
      !this.submitting
    ) {
      this.currentPage--;
      this.loadManualReviewDeals();
    }
  }

  nextPage(): void {
    if (
      this.currentPage + 1 < this.totalPages &&
      !this.loading &&
      !this.submitting
    ) {
      this.currentPage++;
      this.loadManualReviewDeals();
    }
  }

  trackByDealId(
    index: number,
    deal: ManualReviewDeal
  ): number {
    return deal.dealId;
  }
}
