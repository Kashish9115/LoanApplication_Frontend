import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';

/** Payment API URLs are centralized here; change environment.apiUrl if backend host/port changes. */
@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly baseUrl = `${environment.apiUrl}/api/payments`;
  private readonly emiUrl = `${environment.apiUrl}/api/emi`;
  constructor(private http: HttpClient) {}

  getEmiBreakdown(emiScheduleId: number) {
    return this.http.get<any>(`${this.emiUrl}/breakdown/${emiScheduleId}`).pipe(timeout(20000));
  }
  getOverdueBreakdown(loanAccountId: number) {
    return this.http.get<any>(`${this.emiUrl}/loan-account/${loanAccountId}/overdue-breakdown`).pipe(timeout(20000));
  }
  createOrder(emiScheduleId: number) {
    return this.http.post<any>(`${this.baseUrl}/create-order/${emiScheduleId}`, {}).pipe(timeout(20000));
  }
  createOverdueOrder(loanAccountId: number) {
    return this.http.post<any>(`${this.baseUrl}/create-order/overdueemis/${loanAccountId}`, {}).pipe(timeout(20000));
  }
  verifyAndPay(payload: {
    loanAccountId: number; emiScheduleId: number; paymentAmount: number; paymentName: string;
    razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string;
  }) {
    return this.http.post<any>(`${this.baseUrl}/verify-and-pay`, payload).pipe(timeout(25000));
  }
  getPaymentHistory(loanAccountId: number, page = 0, size = 10) {
    return this.http.get<any>(`${this.baseUrl}/history/customer/${loanAccountId}`, { params: { page, size } }).pipe(timeout(20000));
  }
}
