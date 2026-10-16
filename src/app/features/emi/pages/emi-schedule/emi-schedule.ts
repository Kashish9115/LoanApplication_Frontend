import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, finalize, timeout, takeUntil } from 'rxjs';
import { Emi } from '../../services/emi';

@Component({
  selector: 'app-emi-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './emi-schedule.html',
  styleUrl: './emi-schedule.scss'
})
export class EmiSchedule implements OnInit, OnDestroy {

  loanAccountId = 4;

  emiSchedules: any[] = [];
  overallEmis: any[] = [];

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  overallTotalElements = 0;

  loading = false;
  summaryLoading = false;

  errorMessage = '';
  successMessage = '';

  selectedEmi: any = null;
  breakdown: any = null;
  modalLoading = false;

  private destroy$ = new Subject<void>();
  private requestId = 0;

  constructor(private emiService: Emi) {}

  ngOnInit(): void {
    this.loadSchedule();
    this.loadOverallSummary();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Load the currently selected server-side page
  loadSchedule(): void {
    const thisRequest = ++this.requestId;
    const requestedPage = this.currentPage;

    this.loading = true;
    this.errorMessage = '';

    this.emiService
      .getSchedule(
        this.loanAccountId,
        requestedPage,
        this.pageSize
      )
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          if (thisRequest === this.requestId) {
            this.loading = false;
          }
        })
      )
      .subscribe({
        next: (response: any) => {
          console.log('Requested page:', requestedPage);
          console.log('API response:', response);

          // Ignore a stale response from an earlier request
          if (thisRequest !== this.requestId) {
            return;
          }

          if (!response || !Array.isArray(response.content)) {
            this.errorMessage =
              'Unexpected API response. Expected a paginated response.';
            this.emiSchedules = [];
            return;
          }

          this.emiSchedules = response.content;
          this.currentPage = Number(
            response.pageNumber ?? requestedPage
          );
          this.pageSize = Number(
            response.pageSize ?? this.pageSize
          );
          this.totalPages = Number(response.totalPages ?? 0);
          this.totalElements = Number(response.totalElements ?? 0);

          console.log('Displayed page:', this.currentPage);
          console.log('Records received:', this.emiSchedules.length);
          console.log('Total pages:', this.totalPages);
        },

        error: (error: any) => {
          if (thisRequest !== this.requestId) {
            return;
          }

          console.error('EMI schedule request failed:', error);

          this.errorMessage =
            error?.name === 'TimeoutError'
              ? 'EMI request timed out. Please try again.'
              : 'Unable to load EMI schedule. Please try again.';
        }
      });
  }

  // Load all pages separately for the summary cards
  loadOverallSummary(): void {
    this.summaryLoading = true;
    this.overallEmis = [];
    this.overallTotalElements = 0;

    this.fetchSummaryPage(0, []);
  }

  private fetchSummaryPage(
    page: number,
    accumulated: any[]
  ): void {
    this.emiService
      .getSchedule(this.loanAccountId, page, this.pageSize)
      .pipe(
        takeUntil(this.destroy$),
        timeout(15000)
      )
      .subscribe({
        next: (response: any) => {
          if (!response || !Array.isArray(response.content)) {
            this.summaryLoading = false;
            this.errorMessage =
              'Unable to read the overall EMI summary.';
            return;
          }

          const records = [...accumulated, ...response.content];

          this.overallTotalElements = Number(
            response.totalElements ?? records.length
          );

          const pages = Number(response.totalPages ?? 0);

          if (page + 1 < pages) {
            this.fetchSummaryPage(page + 1, records);
          } else {
            this.overallEmis = records;
            this.summaryLoading = false;
          }
        },

        error: (error: any) => {
          console.error('EMI summary request failed:', error);
          this.summaryLoading = false;
          this.errorMessage =
            'Overall EMI summary could not be loaded.';
        }
      });
  }

  changePage(page: number): void {
    if (
      this.loading ||
      page < 0 ||
      page >= this.totalPages ||
      page === this.currentPage
    ) {
      return;
    }

    this.currentPage = page;
    this.loadSchedule();
  }

  getStatus(emi: any): string {
    const status = String(
      emi?.paymentStatus ?? ''
    ).toUpperCase();

    if (
      status === 'PAID' ||
      status === 'CANCELLED' ||
      status === 'OVERDUE'
    ) {
      return status;
    }

    const dueDate = String(emi?.dueDate ?? '').substring(0, 10);

    if (dueDate && dueDate < this.today()) {
      return 'OVERDUE';
    }

    return status || 'PENDING';
  }

  today(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  formatDate(value: string): string {
    if (!value) {
      return '—';
    }

    const datePart = value.substring(0, 10);
    const parts = datePart.split('-');

    if (parts.length !== 3) {
      return value;
    }

    const date = new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2])
    );

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  get totalLoanAmount(): number {
    if (!this.overallEmis.length) {
      return 0;
    }

    const firstInstallment = [...this.overallEmis].sort(
      (a, b) => Number(a.installmentNo) - Number(b.installmentNo)
    )[0];

    return Number(firstInstallment?.openingBalance) || 0;
  }

  get outstandingPrincipal(): number {
    const unpaid = this.overallEmis
      .filter(emi =>
        ['PENDING', 'OVERDUE'].includes(this.getStatus(emi))
      )
      .sort(
        (a, b) => Number(a.installmentNo) - Number(b.installmentNo)
      );

    return unpaid.length
      ? Number(unpaid[0]?.openingBalance) || 0
      : 0;
  }

  get paidCount(): number {
    return this.overallEmis.filter(
      emi => this.getStatus(emi) === 'PAID'
    ).length;
  }

  get nextEmi(): any {
    const pending = this.overallEmis
      .filter(emi => this.getStatus(emi) === 'PENDING')
      .sort((a, b) => {
        const dateComparison = String(a.dueDate ?? '')
          .localeCompare(String(b.dueDate ?? ''));

        return dateComparison !== 0
          ? dateComparison
          : Number(a.installmentNo) - Number(b.installmentNo);
      });

    return pending.length ? pending[0] : null;
  }

  get emiAmount(): number {
    return Number(
      this.nextEmi?.emiAmount ?? this.nextEmi?.emi
    ) || 0;
  }

  openBreakdown(emi: any): void {
    if (!emi?.emiScheduleId) {
      this.errorMessage = 'EMI schedule ID is missing.';
      return;
    }

    this.selectedEmi = emi;
    this.breakdown = null;
    this.modalLoading = true;

    this.emiService
      .getBreakdown(emi.emiScheduleId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.modalLoading = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          this.breakdown = response;
        },
        error: (error: any) => {
          console.error('EMI breakdown request failed:', error);
          this.errorMessage = 'Unable to load EMI breakdown.';
        }
      });
  }

  closeBreakdown(): void {
    this.selectedEmi = null;
    this.breakdown = null;
    this.modalLoading = false;
  }

  get totalPayable(): number {
    const baseAmount = Number(
      this.breakdown?.emiAmount ??
      this.breakdown?.emi ??
      this.selectedEmi?.emiAmount ??
      this.selectedEmi?.emi ??
      0
    );

    const bounceCharge = Number(
      this.breakdown?.bounceCharge ?? 0
    );

    const lateFee = Number(
      this.breakdown?.lateFee ??
      this.breakdown?.lateFees ??
      0
    );

    return baseAmount + bounceCharge + lateFee;
  }

  payNow(emi: any): void {
    this.openBreakdown(emi);
  }

  proceedToPayment(): void {
    this.errorMessage =
      'Razorpay payment API is not connected yet.';
  }

  downloadReceipt(emi: any): void {
    this.errorMessage =
      `Receipt API is not connected for installment ${emi.installmentNo}.`;
  }

  trackByEmiId(index: number, emi: any): number {
    return emi.emiScheduleId;
  }
}
