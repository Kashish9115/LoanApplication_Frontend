
import {
  Component,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  finalize,
  forkJoin,
  timeout
} from 'rxjs';

import { LoanDealService } from '../../services/loan-deal';
import { EligibilityService } from '../../services/eligibility';
import { ScorecardService } from '../../services/scorecard';

import {
  LoanDealRequest,
  LoanDealResponse
} from '../../models/loan-deal.model';

import {
  EligibilityResponse
} from '../../models/eligibility.model';

import {
  ScorecardResponse
} from '../../models/scorecard.model';

@Component({
  selector: 'app-apply-loan',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './apply-loan.html',
  styleUrl: './apply-loan.scss'
})
export class ApplyLoan {

  private loanDealService = inject(LoanDealService);
  private eligibilityService = inject(EligibilityService);
  private scorecardService = inject(ScorecardService);
  private cdr = inject(ChangeDetectorRef);

  // API response data
  eligibility: EligibilityResponse | null = null;
  scorecard: ScorecardResponse | null = null;
  createdDeal: LoanDealResponse | null = null;

  // Loading states
  loading = false;
  submitting = false;

  // Messages
  errorMessage = '';
  successMessage = '';

  // Loan application form
  form: LoanDealRequest = {
    customerId: 0,
    loanType: 'HOME_LOAN',
    requestedLoanAmount: 0,
    tenureMonths: 120,
    emiDay: 5,
    bankName: '',
    bankAccountNumber: '',
    accountHolderName: '',
    ifscCode: ''
  };

  // STEP 1: Fetch existing eligibility and scorecard
  loadEligibility(): void {

    if (this.loading || this.submitting) {
      return;
    }

    if (
      !Number.isInteger(this.form.customerId) ||
      this.form.customerId <= 0
    ) {
      this.errorMessage = 'Enter a valid Customer ID';
      return;
    }

    this.loading = true;

    this.errorMessage = '';
    this.successMessage = '';

    this.eligibility = null;
    this.scorecard = null;
    this.createdDeal = null;

    // Capture customer ID to validate returned records
    const customerId = this.form.customerId;

    forkJoin({
      eligibility:
        this.eligibilityService.getLatestEligibility(customerId),

      scorecard:
        this.scorecardService.getLatestScorecard(customerId)
    })
      .pipe(
        timeout(15000),

        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (response) => {

          if (
            response.eligibility.success &&
            response.scorecard.success &&
            response.eligibility.data &&
            response.scorecard.data
          ) {

            const eligibilityData = response.eligibility.data;
            const scorecardData = response.scorecard.data;

            // Prevent using stale data for another customer
            if (
              this.form.customerId !== customerId ||
              eligibilityData.customerId !== customerId ||
              scorecardData.customerId !== customerId
            ) {
              this.errorMessage =
                'Customer ID changed. Fetch eligibility again.';

              this.cdr.detectChanges();
              return;
            }

            this.eligibility = eligibilityData;
            this.scorecard = scorecardData;

            if (!this.eligibility.eligible) {

              this.errorMessage =
                this.eligibility.rejectionReason ||
                'Customer is not eligible for a loan';

            } else if (
              this.scorecard.currentStatus === 'REJECTED'
            ) {

              this.errorMessage =
                this.scorecard.rejectionReason ||
                'Scorecard has been rejected';

            } else {

              this.successMessage =
                'Eligibility and Scorecard loaded successfully';
            }

          } else {

            this.errorMessage =
              'Eligibility or Scorecard is unavailable';
          }

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error('Eligibility API error:', error);

          if (error.name === 'TimeoutError') {

            this.errorMessage =
              'Request timed out. Please try again.';

          } else if (error.status === 0) {

            this.errorMessage =
              'Unable to connect to Spring Boot backend. Check CORS and server port.';

          } else {

            this.errorMessage =
              error.error?.message ||
              'Generate Eligibility and Scorecard first';
          }

          this.cdr.detectChanges();
        }
      });
  }

  // STEP 2: Check whether customer can apply
  get canApply(): boolean {

    if (
      !this.eligibility ||
      !this.scorecard
    ) {
      return false;
    }

    // Customer must match both backend records
    if (
      this.eligibility.customerId !== this.form.customerId ||
      this.scorecard.customerId !== this.form.customerId
    ) {
      return false;
    }

    if (!this.eligibility.eligible) {
      return false;
    }

    if (this.scorecard.currentStatus === 'REJECTED') {
      return false;
    }

    // Manual review customers ARE allowed to apply
    if (
      !Number.isFinite(this.form.requestedLoanAmount) ||
      this.form.requestedLoanAmount <= 0
    ) {
      return false;
    }

    if (
      this.form.requestedLoanAmount >
      this.eligibility.eligibleLoanAmount
    ) {
      return false;
    }

    return true;
  }

  // STEP 3: Submit Loan Application
  submitLoan(): void {

    if (this.submitting || this.loading) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.canApply) {

      this.errorMessage =
        'Please verify eligibility and enter a valid loan amount.';

      return;
    }

    // Validate loan type
    if (
      !['HOME_LOAN', 'VEHICLE_LOAN'].includes(this.form.loanType)
    ) {

      this.errorMessage = 'Select a valid Loan Type';
      return;
    }

    // Validate loan tenure
    if (
      !Number.isInteger(this.form.tenureMonths) ||
      this.form.tenureMonths <= 0
    ) {

      this.errorMessage = 'Enter a valid loan tenure';
      return;
    }

    // Validate EMI day
    if (
      ![5, 7, 10, 15].includes(Number(this.form.emiDay))
    ) {

      this.errorMessage =
        'Select EMI Day: 5, 7, 10 or 15';

      return;
    }

    // Validate bank details
    if (
      !this.form.bankName.trim() ||
      !this.form.accountHolderName.trim() ||
      !this.form.bankAccountNumber.trim() ||
      !this.form.ifscCode.trim()
    ) {

      this.errorMessage =
        'Please fill all bank account details';

      return;
    }

    // Validate bank account number
    const accountNumber =
      this.form.bankAccountNumber.trim();

    if (!/^[0-9]{9,18}$/.test(accountNumber)) {

      this.errorMessage =
        'Bank Account Number must contain 9 to 18 digits';

      return;
    }

    // Validate Indian IFSC format
    const ifscCode =
      this.form.ifscCode.trim().toUpperCase();

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {

      this.errorMessage =
        'Enter a valid IFSC Code (example: HDFC0001234)';

      return;
    }

    // Prepare backend request without disbursement date
    const request: LoanDealRequest = {
      ...this.form,
      bankName: this.form.bankName.trim(),
      accountHolderName: this.form.accountHolderName.trim(),
      bankAccountNumber: accountNumber,
      ifscCode: ifscCode
    };

    this.submitting = true;
    this.createdDeal = null;

    console.log('Submitting Loan Application:', {
      customerId: request.customerId,
      loanType: request.loanType,
      requestedLoanAmount: request.requestedLoanAmount,
      tenureMonths: request.tenureMonths
    });

    this.loanDealService
      .createLoanDeal(request)
      .pipe(
        timeout(15000),

        finalize(() => {
          this.submitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (response) => {

          console.log('Loan Deal Response:', response);

          if (response.success && response.data) {

            this.createdDeal = response.data;

            this.successMessage =
              response.message ||
              'Loan Application Submitted Successfully';

          } else {

            this.errorMessage =
              response.message ||
              'Loan Application Failed';
          }

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error('Loan Deal API Error:', error);

          if (error.name === 'TimeoutError') {

            this.errorMessage =
              'Request timed out. Check if the loan was already created before retrying.';

          } else if (error.status === 0) {

            this.errorMessage =
              'Unable to connect to Spring Boot backend.';

          } else {

            this.errorMessage =
              error.error?.message ||
              'Unable to submit Loan Application';
          }

          this.cdr.detectChanges();
        }
      });
  }
}
