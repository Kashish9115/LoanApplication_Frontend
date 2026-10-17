
import {
  Component,
  ChangeDetectorRef,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs';

import { LoanAccountService } from '../../services/loan-account';
import { SanctionService } from '../../services/sanction';

import { OfficerLoanDeal } from '../../models/sanction.model';
import {
  LoanAccountResponse,
  PageResponse
} from '../../models/loan-account.model';

type AccountLookupState =
  | 'idle'
  | 'loading'
  | 'found'
  | 'not-found'
  | 'error';

@Component({
  selector: 'app-loan-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loan-account.html',
  styleUrl: './loan-account.scss'
})
export class LoanAccount implements OnInit {

  private loanAccountService = inject(LoanAccountService);
  private sanctionService = inject(SanctionService);
  private cdr = inject(ChangeDetectorRef);

  // Existing Deal search
  dealId: number | null = null;
  loanDeal: OfficerLoanDeal | null = null;
  loanAccount: LoanAccountResponse | null = null;

  loading = false;
  checkingAccount = false;
  creating = false;
  showCreateModal = false;

  errorMessage = '';
  successMessage = '';
  modalError = '';

  accountLookup: AccountLookupState = 'idle';
  private requestVersion = 0;

  // All loan accounts list
  allLoanAccounts: LoanAccountResponse[] = [];
  listLoading = false;
  listError = '';

  // Search and filter
  listSearch = '';
  statusFilter = 'ALL';

  // Server-side pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  firstPage = true;
  lastPage = true;

  ngOnInit(): void {
    this.loadAllLoanAccounts();
  }

  get isBusy(): boolean {
    return this.loading ||
      this.checkingAccount ||
      this.creating;
  }

  get canCreate(): boolean {
    return this.loanDeal !== null &&
      this.loanDeal.dealStatus === 'DISBURSED' &&
      this.accountLookup === 'not-found' &&
      this.loanAccount === null &&
      !this.isBusy;
  }

  // Filter the currently loaded page
  get filteredLoanAccounts(): LoanAccountResponse[] {
    const search = this.listSearch.trim().toLowerCase();

    return this.allLoanAccounts.filter(account => {
      const matchesSearch =
        !search ||
        String(account.loanAccountNo ?? '').toLowerCase().includes(search) ||
        String(account.loanAccountId ?? '').includes(search) ||
        String(account.dealId ?? '').includes(search) ||
        String(account.customerId ?? '').includes(search);

      const matchesStatus =
        this.statusFilter === 'ALL' ||
        account.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  // Load all loan accounts for the current page
  loadAllLoanAccounts(page: number = this.currentPage): void {
    this.listLoading = true;
    this.listError = '';

    this.loanAccountService
      .getAllLoanAccounts(page, this.pageSize)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.listLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: response => {
          if (response.success && response.data) {
            const pageData = response.data as PageResponse<LoanAccountResponse>;

            this.allLoanAccounts = pageData.content ?? [];
            this.currentPage = pageData.pageNumber ?? page;
            this.pageSize = pageData.pageSize ?? this.pageSize;
            this.totalElements = pageData.totalElements ?? 0;
            this.totalPages = pageData.totalPages ?? 0;
            this.firstPage = pageData.first ?? this.currentPage === 0;
            this.lastPage = pageData.last ??
              this.currentPage >= this.totalPages - 1;
          } else {
            this.allLoanAccounts = [];
            this.listError =
              response.message || 'Unable to load loan accounts.';
          }

          this.cdr.detectChanges();
        },
        error: error => {
          this.allLoanAccounts = [];
          this.listError = this.getError(
            error,
            'Unable to load all loan accounts.'
          );
          this.cdr.detectChanges();
        }
      });
  }

  previousPage(): void {
    if (!this.firstPage && !this.listLoading) {
      this.loadAllLoanAccounts(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (!this.lastPage && !this.listLoading) {
      this.loadAllLoanAccounts(this.currentPage + 1);
    }
  }

  changePageSize(size: number | string): void {
    const parsedSize = Number(size);

    if (!Number.isInteger(parsedSize) || parsedSize < 1) {
      return;
    }

    this.pageSize = parsedSize;
    this.currentPage = 0;
    this.loadAllLoanAccounts(0);
  }

  // Search a loan deal by Deal ID
  searchLoan(): void {
    if (this.isBusy) return;

    if (
      this.dealId === null ||
      !Number.isInteger(this.dealId) ||
      this.dealId <= 0
    ) {
      this.errorMessage = 'Enter a valid Deal ID';
      return;
    }

    const selectedId = this.dealId;
    const version = ++this.requestVersion;

    this.clearData();
    this.loading = true;

    this.sanctionService
      .getLoanDeal(selectedId)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: response => {
          if (
            version !== this.requestVersion ||
            this.dealId !== selectedId
          ) return;

          if (response.success && response.data) {
            this.loanDeal = response.data;
            this.checkExistingAccount(selectedId, version);
          } else {
            this.errorMessage =
              response.message || 'Loan deal not found';
          }

          this.cdr.detectChanges();
        },
        error: error => {
          if (version !== this.requestVersion) return;

          this.errorMessage = this.getError(
            error,
            'Unable to fetch loan deal'
          );
          this.cdr.detectChanges();
        }
      });
  }

  // Check whether the deal already has a loan account
  private checkExistingAccount(
    dealId: number,
    version: number
  ): void {
    this.checkingAccount = true;
    this.accountLookup = 'loading';

    this.loanAccountService
      .getLoanAccountByDealId(dealId)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.checkingAccount = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: response => {
          if (version !== this.requestVersion) return;

          if (response.success && response.data) {
            this.loanAccount = response.data;
            this.accountLookup = 'found';
            this.successMessage =
              'Existing loan account loaded successfully';
          } else {
            this.accountLookup = 'error';
            this.errorMessage =
              response.message || 'Unable to check loan account';
          }

          this.cdr.detectChanges();
        },
        error: error => {
          if (version !== this.requestVersion) return;

          if (error.status === 404) {
            this.accountLookup = 'not-found';

            if (this.loanDeal?.dealStatus === 'DISBURSED') {
              this.successMessage =
                'Loan disbursed. Account can be created.';
            } else {
              this.errorMessage =
                'Loan must be disbursed before account creation.';
            }
          } else {
            this.accountLookup = 'error';
            this.errorMessage = this.getError(
              error,
              'Unable to check existing account'
            );
          }

          this.cdr.detectChanges();
        }
      });
  }

  openCreateModal(): void {
    if (!this.canCreate) {
      this.errorMessage =
        'A disbursed loan without an existing account is required.';
      return;
    }

    this.modalError = '';
    this.showCreateModal = true;
    this.cdr.detectChanges();
  }

  closeCreateModal(): void {
    if (!this.creating) {
      this.showCreateModal = false;
    }
  }

  // Create account and refresh the account list
  createLoanAccount(): void {
    if (!this.canCreate || !this.loanDeal) return;

    const selectedDealId = this.loanDeal.dealId;
    const version = this.requestVersion;

    this.creating = true;
    this.accountLookup = 'loading';
    this.modalError = '';
    this.errorMessage = '';
    this.successMessage = '';

    this.loanAccountService
      .createLoanAccount(selectedDealId)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.creating = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: response => {
          if (version !== this.requestVersion) return;

          if (response.success && response.data) {
            this.loanAccount = response.data;
            this.accountLookup = 'found';
            this.showCreateModal = false;
            this.successMessage =
              response.message ||
              'Loan Account Created Successfully';

            this.currentPage = 0;
            this.loadAllLoanAccounts(0);
          } else {
            this.accountLookup = 'error';
            this.modalError =
              response.message || 'Loan Account Creation Failed';
          }

          this.cdr.detectChanges();
        },
        error: error => {
          if (version !== this.requestVersion) return;

          this.accountLookup = 'error';
          this.modalError = this.getError(
            error,
            'Unable to create loan account'
          );
          this.cdr.detectChanges();
        }
      });
  }

  reset(): void {
    if (this.isBusy) return;

    ++this.requestVersion;
    this.dealId = null;
    this.clearData();
  }

  private clearData(): void {
    this.loanDeal = null;
    this.loanAccount = null;
    this.accountLookup = 'idle';

    this.showCreateModal = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.modalError = '';
  }

  private getError(error: any, fallback: string): string {
    if (error?.name === 'TimeoutError') {
      return 'Request timed out. Please try again.';
    }

    if (error?.status === 0) {
      return 'Unable to connect to Spring Boot backend or CORS is blocked.';
    }

    return error?.error?.message || fallback;
  }
}
