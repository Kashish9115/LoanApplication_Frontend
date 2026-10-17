import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, firstValueFrom, timeout, takeUntil } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Emi } from '../../services/emi';
import { PaymentService } from '../../services/payment.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-emi-schedule', standalone: true,
  imports: [CommonModule], templateUrl: './emi-schedule.html', styleUrl: './emi-schedule.scss'
})
export class EmiSchedule implements OnInit, OnDestroy {
  loanAccountId = 4; // Change this or bind it to the selected ACTIVE loan account.
  emiSchedules: any[] = [];
  overallEmis: any[] = [];
  currentPage = 0; pageSize = 10; totalPages = 0; totalElements = 0; overallTotalElements = 0;
  loading = false; summaryLoading = false; errorMessage = ''; successMessage = '';
  selectedEmi: any = null; breakdown: any = null; modalLoading = false;
  paymentLoading = false; paymentEmiId: number | null = null; paymentError = ''; paymentSuccess = '';
  readonly razorpayKeyId = environment.razorpayKeyId;
  private destroy$ = new Subject<void>();
  private requestId = 0; paymentInProgress = false;

  constructor(private emiService: Emi, private paymentService: PaymentService) {}

  ngOnInit(): void {
    // Restore the last successfully loaded page immediately after refresh, then revalidate it from the API.
    const lastPage = this.readLastPage();
    const savedPage = this.readPageCache(lastPage);
    if (savedPage) this.applyPage(savedPage, lastPage);
    this.loadSchedule(savedPage ? lastPage : 0);
    this.loadOverallSummary();
  }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadSchedule(targetPage: number = this.currentPage): void {
    const request = ++this.requestId;
    const previousPage = this.currentPage;
    const cachedPage = this.readPageCache(targetPage);
    this.loading = true;
    this.errorMessage = '';

    // Keep the current table visible while the next page is loading. If we have a cached
    // page (including after browser refresh), show it immediately while the API revalidates it.
    if (cachedPage) this.applyPage(cachedPage, targetPage);

    this.emiService.getSchedule(this.loanAccountId, targetPage, this.pageSize)
      .pipe(timeout(20000), takeUntil(this.destroy$), finalize(() => {
        if (request === this.requestId) this.loading = false;
      }))
      .subscribe({
        next: (raw: any) => {
          if (request !== this.requestId) return;
          const page = this.unwrapPage(raw);
          if (!page || !Array.isArray(page.content)) {
            this.errorMessage = 'The EMI API returned an unexpected response. Check the Network tab.';
            // Do not erase a previously loaded/cached table because one refresh failed.
            return;
          }
          this.applyPage(page, targetPage);
          this.writePageCache(targetPage, page);
          this.writeLastPage(targetPage);
          this.errorMessage = '';
        },
        error: (err: any) => {
          if (request !== this.requestId) return;
          console.error('EMI schedule load failed', err);
          // Preserve existing records on transient failures. Revert page navigation if the
          // requested page was not cached and could not be fetched.
          if (!cachedPage) this.currentPage = previousPage;
          this.errorMessage = this.apiError(err, 'Could not refresh EMI schedule. Previously loaded records are still shown.');
        }
      });
  }

  private applyPage(page: any, requestedPage: number): void {
    this.emiSchedules = page.content;
    this.currentPage = Number(page.pageNumber ?? page.number ?? requestedPage);
    this.pageSize = Number(page.pageSize ?? page.size ?? this.pageSize);
    this.totalPages = Number(page.totalPages ?? this.totalPages ?? 0);
    this.totalElements = Number(page.totalElements ?? this.totalElements ?? this.emiSchedules.length);
  }

  private pageCacheKey(page: number): string {
    return `emi-schedule:${this.loanAccountId}:page:${page}`;
  }

  private readPageCache(page: number): any | null {
    try {
      if (typeof sessionStorage === 'undefined') return null;
      const value = sessionStorage.getItem(this.pageCacheKey(page));
      if (!value) return null;
      const parsed = JSON.parse(value);
      return Array.isArray(parsed?.content) ? parsed : null;
    } catch { return null; }
  }

  private writePageCache(page: number, value: any): void {
    try {
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(this.pageCacheKey(page), JSON.stringify(value));
    } catch (err) { console.warn('Could not cache EMI page in this tab.', err); }
  }

  private readLastPage(): number {
    try {
      if (typeof sessionStorage === 'undefined') return 0;
      const value = Number(sessionStorage.getItem(`emi-schedule:${this.loanAccountId}:last-page`));
      return Number.isInteger(value) && value >= 0 ? value : 0;
    } catch { return 0; }
  }

  private writeLastPage(page: number): void {
    try {
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(`emi-schedule:${this.loanAccountId}:last-page`, String(page));
    } catch { /* session cache is optional */ }
  }

  async loadOverallSummary(): Promise<void> {
    this.summaryLoading = true;
    try {
      const first = this.unwrapPage(await firstValueFrom(this.emiService.getSchedule(this.loanAccountId, 0, this.pageSize).pipe(timeout(20000))));
      if (!first || !Array.isArray(first.content)) throw new Error('Unexpected summary response');
      const all = [...first.content];
      const pages = Number(first.totalPages ?? 1);
      for (let page = 1; page < pages; page++) {
        const next = this.unwrapPage(await firstValueFrom(this.emiService.getSchedule(this.loanAccountId, page, this.pageSize).pipe(timeout(20000))));
        if (!next || !Array.isArray(next.content)) throw new Error('Unexpected summary page response');
        all.push(...next.content);
      }
      this.overallEmis = all;
      this.overallTotalElements = Number(first.totalElements ?? all.length);
    } catch (err) {
      console.error('Summary load failed', err);
      // Summary failure should not keep the main schedule stuck in loading state.
      if (!this.emiSchedules.length) this.errorMessage = this.apiError(err, 'Schedule loaded, but summary could not be calculated.');
    } finally { this.summaryLoading = false; }
  }

  changePage(page: number): void {
    if (this.loading || page < 0 || page >= this.totalPages || page === this.currentPage) return;
    this.loadSchedule(page);
  }

  today(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  getStatus(emi: any): string {
    const status = String(emi?.paymentStatus ?? 'PENDING').toUpperCase();
    if (status === 'PAID' || status === 'CANCELLED') return status;
    return String(emi?.dueDate ?? '').slice(0,10) < this.today() ? 'OVERDUE' : 'PENDING';
  }
  formatDate(value: string): string {
    if (!value) return '—';
    const [y,m,d] = value.slice(0,10).split('-').map(Number);
    if (!y || !m || !d) return value;
    return new Date(y,m-1,d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
  }
  get totalLoanAmount(): number {
    const first = [...this.overallEmis].sort((a,b)=>Number(a.installmentNo)-Number(b.installmentNo))[0];
    return Number(first?.openingBalance ?? 0);
  }
  get outstandingPrincipal(): number {
    const unpaid = this.overallEmis.filter(x=>['PENDING','OVERDUE'].includes(this.getStatus(x))).sort((a,b)=>Number(a.installmentNo)-Number(b.installmentNo));
    return unpaid.length ? Number(unpaid[0].openingBalance ?? 0) : 0;
  }
  get paidCount(): number { return this.overallEmis.filter(x=>this.getStatus(x)==='PAID').length; }
  get pendingCount(): number { return this.overallEmis.filter(x=>['PENDING','OVERDUE'].includes(this.getStatus(x))).length; }
  get nextEmi(): any {
    return [...this.overallEmis].filter(x=>['PENDING','OVERDUE'].includes(this.getStatus(x))).sort((a,b)=>Number(a.installmentNo)-Number(b.installmentNo))[0] ?? null;
  }
  get emiAmount(): number { return Number(this.nextEmi?.emiAmount ?? this.nextEmi?.emi ?? 0); }
  private unwrapPage(raw: any): any {
    let v=raw;
    for(let i=0;i<4 && v && !Array.isArray(v.content);i++) {
      const next=v.data ?? v.result ?? v.response ?? v.payload;
      if (next == null || next === v) break;
      v=next;
    }
    return v;
  }
  private unwrapObject(raw: any): any { return raw?.data ?? raw?.result ?? raw?.payload ?? raw; }
  private apiError(err: any, fallback: string): string { return err?.error?.message ?? err?.error?.error ?? err?.message ?? fallback; }

  canPay(emi: any): boolean {
    if (
      !emi ||
      String(emi.paymentStatus ?? 'PENDING').toUpperCase() !== 'PENDING' ||
      this.getStatus(emi) !== 'PENDING'
    ) {
      return false;
    }
    return Boolean(String(emi.dueDate ?? '').slice(0, 10));
  }

  isPaymentEmi(emi: any): boolean {
    return this.paymentEmiId === Number(emi?.emiScheduleId);
  }

  /** Click Pay EMI -> ask backend for the authoritative order amount -> open Razorpay Checkout. */
  async payNow(emi: any): Promise<void> {
    this.paymentError = '';
    this.paymentSuccess = '';

    if (!this.canPay(emi)) {
      this.paymentError = 'Only PENDING installments can be paid from this screen.';
      return;
    }
    if (this.paymentInProgress || this.paymentLoading) return;
    if (!this.razorpayKeyId || this.razorpayKeyId.includes('YOUR_RAZORPAY')) {
      this.paymentError = 'Razorpay is not configured. Set razorpayKeyId in the active environment file.';
      return;
    }

    this.paymentInProgress = true;
    this.paymentLoading = true;
    this.paymentEmiId = Number(emi.emiScheduleId);
    this.errorMessage = '';

    try {
      await this.loadRazorpayScript();

      // Backend creates the order and determines the amount. Do not calculate or hardcode it in Angular.
      const rawOrder = await firstValueFrom(
        this.paymentService.createOrder(Number(emi.emiScheduleId)).pipe(timeout(20000))
      );
      const order = this.unwrapObject(rawOrder);
      const amount = Number(order?.amount);
      const orderId = order?.razorpayOrderId ?? order?.razorpay_order_id ?? order?.orderId;
      const selectedEmiId = Number(emi.emiScheduleId);
      const orderEmiId = order?.emiScheduleId == null ? selectedEmiId : Number(order.emiScheduleId);

      if (!orderId || !Number.isFinite(amount) || amount <= 0 || orderEmiId !== selectedEmiId) {
        throw new Error('The payment order does not match the selected EMI or has an invalid amount.');
      }

      const selected = emi;
      const checkout = new (window as any).Razorpay({
        key: this.razorpayKeyId,
        // Razorpay Checkout expects amount in the smallest currency unit (paise for INR).
        amount: Math.round(amount * 100),
        currency: order?.currency || 'INR',
        name: 'Loan Management System',
        description: `Unpaid EMIs through installment #${selected.installmentNo}, including applicable charges`,
        order_id: orderId,
        prefill: {
          name: order?.customerName || '',
          email: order?.customerEmail || '',
          contact: order?.customerPhone || ''
        },
        notes: { loanAccountId: String(order?.loanAccountId ?? this.loanAccountId), emiScheduleId: String(selectedEmiId) },
        handler: (response: any) => {
          const payload = {
            loanAccountId: Number(order?.loanAccountId ?? this.loanAccountId),
            emiScheduleId: selectedEmiId,
            paymentAmount: amount,
            paymentName: `EMI payment through installment #${selected.installmentNo}`,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          };
          this.paymentService.verifyAndPay(payload).pipe(
            timeout(25000),
            finalize(() => {
              this.paymentLoading = false;
              this.paymentInProgress = false;
              this.paymentEmiId = null;
            })
          ).subscribe({
            next: () => {
              this.paymentSuccess = `Payment verified. Pending installments through #${selected.installmentNo} are now marked paid.`;
              this.successMessage = this.paymentSuccess;
              // Re-fetch from backend; the UI only shows PAID after backend verification updates the record.
              this.loadSchedule(this.currentPage);
              void this.loadOverallSummary();
            },
            error: (err: any) => {
              this.paymentError = this.apiError(err, 'Razorpay payment completed but backend verification failed. Check payment status before retrying.');
            }
          });
        },
        modal: { ondismiss: () => {
          this.paymentLoading = false;
          this.paymentInProgress = false;
          this.paymentEmiId = null;
        } },
        theme: { color: '#2459d3' }
      });

      checkout.on('payment.failed', (event: any) => {
        this.paymentError = event?.error?.description || 'Payment failed. EMI remains unpaid.';
        this.paymentLoading = false;
        this.paymentInProgress = false;
        this.paymentEmiId = null;
      });
      checkout.open();
      // The checkout has opened; keep other payment buttons locked but stop showing "Starting…".
      this.paymentLoading = false;
      this.paymentEmiId = null;
    } catch (err: any) {
      this.paymentError = this.apiError(err, 'Unable to start Razorpay Checkout.');
      this.paymentLoading = false;
      this.paymentInProgress = false;
      this.paymentEmiId = null;
    }
  }
  private loadRazorpayScript(): Promise<void> {
    if ((window as any).Razorpay) return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const script=document.createElement('script'); script.src='https://checkout.razorpay.com/v1/checkout.js'; script.onload=()=>resolve(); script.onerror=()=>reject(new Error('Razorpay Checkout script failed to load. Check internet connection.')); document.body.appendChild(script);
    });
  }
  trackByEmiId(_:number,emi:any):number { return Number(emi.emiScheduleId); }
}
