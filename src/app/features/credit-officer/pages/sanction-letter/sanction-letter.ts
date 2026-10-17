
import {
  Component,
  ChangeDetectorRef,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs';

import { SanctionService } from '../../services/sanction';
import { DisbursementService } from '../../services/disbursement';

import {
  OfficerLoanDeal,
  SanctionResponse
} from '../../models/sanction.model';

import {
  BankPartner,
  DisbursementRequest,
  DisbursementResponse
} from '../../models/disbursement.model';

@Component({
  selector: 'app-sanction-letter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sanction-letter.html',
  styleUrl: './sanction-letter.scss'
})
export class SanctionLetter implements OnInit {

  private readonly sanctionService = inject(SanctionService);
  private readonly disbursementService = inject(DisbursementService);
  private readonly cdr = inject(ChangeDetectorRef);

  dealId: number | null = null;

  loanDeal: OfficerLoanDeal | null = null;
  sanction: SanctionResponse | null = null;
  disbursement: DisbursementResponse | null = null;

  sanctionHistory: SanctionResponse[] = [];
  historyLoading = false;
  historyError = '';

  disbursementDate = '';
  selectedBankPartner: BankPartner | '' = '';

  bankPartners: BankPartner[] = [
    'Bank Of India',
    'HDFC Bank',
    'ICICI Bank',
    'Bank Of Maharashtra',
    'State Bank Of India',
    'Axis Bank'
  ];

  loading = false;
  generating = false;
  disbursementLoading = false;
  disbursementSubmitting = false;

  showGenerateModal = false;
  showPreviewModal = false;
  showDisbursementModal = false;

  errorMessage = '';
  successMessage = '';
  modalError = '';

  disbursementLookup:
    'idle' | 'loading' | 'found' | 'not-found' | 'error' = 'idle';

  ngOnInit(): void {
    this.loadSanctionHistory();
  }

  get isBusy(): boolean {
    return this.loading ||
      this.generating ||
      this.disbursementLoading ||
      this.disbursementSubmitting;
  }

  get canGenerate(): boolean {
    return !!this.loanDeal &&
      ['APPROVED', 'AUTO_APPROVED'].includes(
        this.loanDeal.dealStatus
      ) &&
      !this.sanction &&
      !this.isBusy;
  }

  get canOpenDisbursement(): boolean {
    return !!this.loanDeal &&
      [
        'SANCTIONED',
        'DISBURSEMENT_PENDING',
        'DISBURSED'
      ].includes(this.loanDeal.dealStatus);
  }

  get canCreateDisbursement(): boolean {
    return this.loanDeal?.dealStatus === 'SANCTIONED' &&
      this.disbursementLookup === 'not-found' &&
      !this.disbursement &&
      !this.isBusy;
  }

  get canCompleteDisbursement(): boolean {
    return this.disbursement !== null &&
      this.loanDeal?.dealStatus === 'DISBURSEMENT_PENDING' &&
      ['PENDING', 'PROCESSING'].includes(
        this.disbursement.disbursementStatus
      ) &&
      !this.isBusy;
  }

  loadSanctionHistory(): void {
    if (this.historyLoading) return;

    this.historyLoading = true;
    this.historyError = '';

    this.sanctionService.getAllSanctions()
      .pipe(
        timeout(15000),
        finalize(() => {
          this.historyLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: response => {
          if (response.success && Array.isArray(response.data)) {
            this.sanctionHistory = response.data;
          } else {
            this.historyError =
              response.message || 'Unable to load sanction history.';
          }

          this.cdr.detectChanges();
        },
        error: error => {
          this.historyError = this.apiError(
            error,
            'Unable to load sanction history.'
          );
          this.cdr.detectChanges();
        }
      });
  }

  viewHistoricalSanction(item: SanctionResponse): void {
    if (this.isBusy) return;

    this.loading = true;
    this.errorMessage = '';

    this.sanctionService.getSanctionById(item.sanctionId)
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
            this.sanction = response.data;
            this.showPreviewModal = true;
          } else {
            this.errorMessage =
              response.message || 'Sanction not found.';
          }

          this.cdr.detectChanges();
        },
        error: error => {
          this.errorMessage = this.apiError(
            error,
            'Unable to retrieve historical sanction.'
          );
          this.cdr.detectChanges();
        }
      });
  }

  searchLoan(): void {
    if (this.isBusy) return;

    if (
      !this.dealId ||
      !Number.isInteger(this.dealId) ||
      this.dealId <= 0
    ) {
      this.errorMessage = 'Enter valid Deal ID';
      return;
    }

    const searchedId = this.dealId;

    this.loanDeal = null;
    this.sanction = null;
    this.disbursement = null;

    this.errorMessage = '';
    this.successMessage = '';
    this.modalError = '';

    this.showGenerateModal = false;
    this.showPreviewModal = false;
    this.showDisbursementModal = false;

    this.loading = true;

    this.sanctionService.getLoanDeal(searchedId)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: response => {
          if (this.dealId !== searchedId) return;

          if (response.success && response.data) {
            this.loanDeal = response.data;
            this.successMessage = 'Loan deal loaded successfully';

            if (
              [
                'SANCTIONED',
                'DISBURSEMENT_PENDING',
                'DISBURSED'
              ].includes(this.loanDeal.dealStatus)
            ) {
              this.loadExistingSanction(searchedId);
            }
          } else {
            this.errorMessage =
              response.message || 'Loan deal not found';
          }

          this.cdr.detectChanges();
        },
        error: error => {
          this.errorMessage = this.apiError(
            error,
            'Unable to load loan deal'
          );
          this.cdr.detectChanges();
        }
      });
  }

  private loadExistingSanction(dealId: number): void {
    this.sanctionService.getSanctionByDeal(dealId)
      .pipe(timeout(15000))
      .subscribe({
        next: response => {
          if (this.loanDeal?.dealId !== dealId) return;

          if (response.success && response.data) {
            this.sanction = response.data;
          }

          this.cdr.detectChanges();
        },
        error: error => {
          console.error('Existing sanction lookup failed:', error);
        }
      });
  }

  openGenerateModal(): void {
    if (!this.canGenerate) {
      this.errorMessage =
        'Only approved deals can generate sanction.';
      return;
    }

    this.showGenerateModal = true;
  }

  closeGenerateModal(): void {
    if (!this.generating) {
      this.showGenerateModal = false;
    }
  }

  generateSanction(): void {
    if (!this.canGenerate || !this.loanDeal) return;

    const dealId = this.loanDeal.dealId;

    this.generating = true;
    this.errorMessage = '';

    this.sanctionService.generateSanction(dealId)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.generating = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: response => {
          if (this.loanDeal?.dealId !== dealId) return;

          if (response.success && response.data) {
            this.sanction = response.data;

            this.loanDeal = {
              ...this.loanDeal,
              dealStatus: response.data.dealStatus
            };

            this.showGenerateModal = false;
            this.successMessage =
              response.message || 'Sanction generated successfully';

            this.loadSanctionHistory();
          } else {
            this.errorMessage =
              response.message || 'Unable to generate sanction';
          }

          this.cdr.detectChanges();
        },
        error: error => {
          this.errorMessage = this.apiError(
            error,
            'Unable to generate sanction'
          );
          this.cdr.detectChanges();
        }
      });
  }

  viewSanction(): void {
    if (!this.loanDeal) return;

    if (this.sanction) {
      this.showPreviewModal = true;
      return;
    }

    const dealId = this.loanDeal.dealId;

    this.loading = true;
    this.errorMessage = '';

    this.sanctionService.getSanctionByDeal(dealId)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: response => {
          if (this.loanDeal?.dealId !== dealId) return;

          if (response.success && response.data) {
            this.sanction = response.data;
            this.showPreviewModal = true;
          } else {
            this.errorMessage =
              response.message || 'Sanction not found';
          }

          this.cdr.detectChanges();
        },
        error: error => {
          this.errorMessage = this.apiError(
            error,
            'Unable to retrieve sanction'
          );
          this.cdr.detectChanges();
        }
      });
  }

  previewGenerated(): void {
    this.viewSanction();
  }

  closePreviewModal(): void {
    this.showPreviewModal = false;
  }

  openDisbursementModal(): void {
    if (!this.loanDeal || !this.canOpenDisbursement) {
      this.errorMessage =
        'Sanction must be generated before disbursement.';
      return;
    }

    this.modalError = '';
    this.disbursement = null;
    this.disbursementLookup = 'idle';
    this.disbursementDate = '';
    this.selectedBankPartner = '';

    this.showDisbursementModal = true;
    this.loadExistingDisbursement();
  }

  openHistoricalDisbursement(item: SanctionResponse): void {
    if (this.isBusy) return;

    this.dealId = item.dealId;
    this.errorMessage = '';
    this.successMessage = '';
    this.modalError = '';

    this.loading = true;

    this.sanctionService.getLoanDeal(item.dealId)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: response => {
          if (!response.success || !response.data) {
            this.errorMessage =
              response.message ||
              'Unable to load the selected loan deal.';
            return;
          }

          this.loanDeal = response.data;
          this.sanction = item;

          if (this.canOpenDisbursement) {
            this.openDisbursementModal();
          } else {
            this.errorMessage =
              'Disbursement is not available for deal status: ' +
              this.loanDeal.dealStatus;
          }

          this.cdr.detectChanges();
        },
        error: error => {
          this.errorMessage = this.apiError(
            error,
            'Unable to load the loan deal for disbursement.'
          );
          this.cdr.detectChanges();
        }
      });
  }

  closeDisbursementModal(): void {
    if (
      !this.disbursementSubmitting &&
      !this.disbursementLoading
    ) {
      this.showDisbursementModal = false;
    }
  }

  loadExistingDisbursement(): void {
    if (!this.loanDeal || this.disbursementLoading) return;

    const dealId = this.loanDeal.dealId;

    this.disbursementLoading = true;
    this.disbursementLookup = 'loading';
    this.modalError = '';

    this.disbursementService.getLatestDisbursement(dealId)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.disbursementLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: response => {
          if (this.loanDeal?.dealId !== dealId) return;

          if (response.success && response.data) {
            this.disbursement = response.data;
            this.disbursementLookup = 'found';

            this.loanDeal = {
              ...this.loanDeal,
              dealStatus: response.data.dealStatus
            };
          } else {
            this.disbursementLookup = 'error';
            this.modalError =
              response.message || 'Unable to fetch disbursement';
          }

          this.cdr.detectChanges();
        },
        error: error => {
          if (error.status === 404) {
            this.disbursementLookup = 'not-found';
          } else {
            this.disbursementLookup = 'error';
            this.modalError = this.apiError(
              error,
              'Failed to load disbursement'
            );
          }

          this.cdr.detectChanges();
        }
      });
  }

  createDisbursement(): void {
    if (!this.canCreateDisbursement || !this.loanDeal) return;

    if (!this.disbursementDate) {
      this.modalError = 'Please select a disbursement date.';
      return;
    }

    if (!this.selectedBankPartner) {
      this.modalError = 'Please select a bank partner.';
      return;
    }

    const request: DisbursementRequest = {
      dealId: this.loanDeal.dealId,
      disbursementDate: this.disbursementDate,
      bankName: this.selectedBankPartner
    };

    const dealId = this.loanDeal.dealId;

    this.disbursementSubmitting = true;
    this.disbursementLookup = 'loading';
    this.modalError = '';

    this.disbursementService.createDisbursement(request)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.disbursementSubmitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: response => {
          if (this.loanDeal?.dealId !== dealId) return;

          if (response.success && response.data) {
            this.disbursement = response.data;
            this.disbursementLookup = 'found';

            this.loanDeal = {
              ...this.loanDeal,
              dealStatus: response.data.dealStatus
            };

            this.successMessage =
              'Disbursement created successfully';

            this.loadSanctionHistory();
          } else {
            this.disbursementLookup = 'error';
            this.modalError =
              response.message || 'Disbursement creation failed';
          }

          this.cdr.detectChanges();
        },
        error: error => {
          this.disbursementLookup = 'error';
          this.modalError = this.apiError(
            error,
            'Unable to create disbursement'
          );
          this.cdr.detectChanges();
        }
      });
  }

  completeDisbursement(): void {
    if (
      !this.canCompleteDisbursement ||
      !this.disbursement ||
      !this.loanDeal
    ) {
      return;
    }

    const disbursementId = this.disbursement.disbursementId;
    const dealId = this.loanDeal.dealId;

    this.disbursementSubmitting = true;
    this.modalError = '';

    this.disbursementService.completeDisbursement(disbursementId)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.disbursementSubmitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: response => {
          if (this.loanDeal?.dealId !== dealId) return;

          if (response.success && response.data) {
            this.disbursement = response.data;

            this.loanDeal = {
              ...this.loanDeal,
              dealStatus: response.data.dealStatus
            };

            this.successMessage =
              response.message || 'Disbursement completed successfully';

            this.modalError = '';
            this.loadSanctionHistory();

            // Refresh the authoritative disbursement status from backend.
            this.disbursementService
              .getLatestDisbursement(dealId)
              .pipe(timeout(15000))
              .subscribe({
                next: latest => {
                  if (
                    this.loanDeal?.dealId === dealId &&
                    latest.success &&
                    latest.data
                  ) {
                    this.disbursement = latest.data;
                    this.loanDeal = {
                      ...this.loanDeal!,
                      dealStatus: latest.data.dealStatus
                    };
                  }

                  this.cdr.detectChanges();
                },
                error: refreshError => {
                  console.error(
                    'Disbursement completed, but status refresh failed:',
                    refreshError
                  );
                }
              });
          } else {
            this.modalError =
              response.message || 'Unable to complete disbursement';
          }

          this.cdr.detectChanges();
        },
        error: error => {
          this.modalError = this.apiError(
            error,
            'Unable to complete disbursement'
          );
          this.cdr.detectChanges();
        }
      });
  }

  maskAccount(account: string | null | undefined): string {
    if (!account) return 'Not available';

    return 'XXXX XXXX ' + account.slice(-4);
  }

  reset(): void {
    if (this.isBusy) return;

    this.dealId = null;
    this.loanDeal = null;
    this.sanction = null;
    this.disbursement = null;

    this.showGenerateModal = false;
    this.showPreviewModal = false;
    this.showDisbursementModal = false;

    this.errorMessage = '';
    this.successMessage = '';
    this.modalError = '';

    this.disbursementDate = '';
    this.selectedBankPartner = '';
    this.disbursementLookup = 'idle';
  }

  private apiError(error: any, fallback: string): string {
    console.error('API request failed:', {
      status: error?.status,
      statusText: error?.statusText,
      url: error?.url,
      message: error?.message,
      response: error?.error
    });

    if (error?.name === 'TimeoutError') {
      return 'Request timed out. Check the backend and verify the record before retrying.';
    }

    if (error?.status === 0) {
      return 'The browser could not connect to the API or access its response. Check the browser Console and Network tabs for the exact error.';
    }

    return error?.error?.message
      || error?.error?.detail
      || error?.message
      || fallback;
  }
}
