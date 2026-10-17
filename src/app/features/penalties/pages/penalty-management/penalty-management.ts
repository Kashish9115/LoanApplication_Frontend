import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { PenaltyCharge } from '../../models/penalty.model';
import { PenaltyService } from '../../services/penalty.service';

@Component({
  selector: 'app-penalty-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './penalty-management.html',
  styleUrl: './penalty-management.scss'
})
export class PenaltyManagement implements OnInit {
  loanAccountId = 4;
  penalties: PenaltyCharge[] = [];
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  loading = false;
  errorMessage = '';
  successMessage = '';
  selectedPenalty: PenaltyCharge | null = null;
  waiverReason = '';
  waiverLoading = false;
  waiverError = '';

  constructor(private readonly penaltyService: PenaltyService) {}

  ngOnInit(): void { this.loadPenalties(); }

  loadAccount(): void {
    const accountId = Number(this.loanAccountId);
    if (!Number.isSafeInteger(accountId) || accountId <= 0) {
      this.penalties = [];
      this.totalElements = 0;
      this.totalPages = 0;
      this.errorMessage = 'Enter a valid loan account ID greater than zero.';
      return;
    }
    this.loanAccountId = accountId;
    this.currentPage = 0;
    this.successMessage = '';
    this.loadPenalties();
  }

  loadPenalties(): void {
    this.loading = true;
    this.errorMessage = '';
    this.penaltyService.getByLoanAccount(this.loanAccountId, this.currentPage, this.pageSize)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: response => {
          this.penalties = response?.content ?? [];
          this.currentPage = Number(response?.pageNumber ?? this.currentPage);
          this.pageSize = Number(response?.pageSize ?? this.pageSize);
          this.totalPages = Number(response?.totalPages ?? 0);
          this.totalElements = Number(response?.totalElements ?? this.penalties.length);
        },
        error: err => {
          this.penalties = [];
          this.errorMessage = err?.error?.message ?? 'Could not load penalty charges. Check that the backend is running and the loan account ID exists.';
        }
      });
  }

  changePage(page: number): void {
    if (this.loading || page < 0 || page >= this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadPenalties();
  }

  get appliedCount(): number { return this.penalties.filter(p => this.status(p) === 'APPLIED').length; }
  get paidCount(): number { return this.penalties.filter(p => this.status(p) === 'PAID').length; }
  get waivedCount(): number { return this.penalties.filter(p => this.status(p) === 'WAIVED').length; }
  get totalAmount(): number { return this.penalties.filter(p => this.status(p) === 'APPLIED').reduce((sum, p) => sum + Number(p.penaltyAmount || 0), 0); }
  status(penalty: PenaltyCharge): string { return String(penalty.status || 'APPLIED').toUpperCase(); }
  formatDate(value?: string): string {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  openWaiver(penalty: PenaltyCharge): void {
    if (this.status(penalty) !== 'APPLIED') return;
    this.selectedPenalty = penalty;
    this.waiverReason = '';
    this.waiverError = '';
  }

  closeWaiver(): void { this.selectedPenalty = null; this.waiverReason = ''; this.waiverError = ''; }

  submitWaiver(): void {
    if (!this.selectedPenalty || this.waiverReason.trim().length < 5 || this.waiverLoading) {
      this.waiverError = 'Enter a reason of at least 5 characters.';
      return;
    }
    this.waiverLoading = true;
    this.waiverError = '';
    this.penaltyService.requestWaiver(this.selectedPenalty.penaltyChargeId, this.waiverReason.trim())
      .pipe(finalize(() => this.waiverLoading = false))
      .subscribe({
        next: () => {
          this.successMessage = `Waiver request submitted for penalty #${this.selectedPenalty?.penaltyChargeId}.`;
          this.closeWaiver();
          this.loadPenalties();
        },
        error: err => {
          this.waiverError = err?.error?.message ?? 'The backend waiver endpoint is not available yet. Add POST /api/penalties/{penaltyChargeId}/waiver before submitting waiver requests.';
        }
      });
  }
}
