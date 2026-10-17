import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { timeout } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Emi {
  private emiUrl = `${environment.apiUrl}/api/emi`;
  private paymentUrl = `${environment.apiUrl}/api/payments`;

  constructor(private http: HttpClient) {}

  getSchedule(loanAccountId: number, page = 0, size = 10) {
    return this.http.get<any>(`${this.emiUrl}/getuseremi/account/${loanAccountId}`, {
      params: { page, size }
    }).pipe(timeout(20000));
  }

  getBreakdown(emiScheduleId: number) {
    return this.http.get<any>(`${this.emiUrl}/breakdown/${emiScheduleId}`).pipe(timeout(20000));
  }

  getOverdueBreakdown(loanAccountId: number) {
    return this.http.get<any>(`${this.emiUrl}/loan-account/${loanAccountId}/overdue-breakdown`).pipe(timeout(20000));
  }

  createOrder(emiScheduleId: number) {
    return this.http.post<any>(`${this.paymentUrl}/create-order/${emiScheduleId}`, {}).pipe(timeout(20000));
  }

  createOverdueOrder(loanAccountId: number) {
    return this.http.post<any>(`${this.paymentUrl}/create-order/overdueemis/${loanAccountId}`, {}).pipe(timeout(20000));
  }

  verifyAndPay(payload: any) {
    return this.http.post<any>(`${this.paymentUrl}/verify-and-pay`, payload).pipe(timeout(20000));
  }

  getPaymentHistory(loanAccountId: number, page = 0, size = 10) {
    return this.http.get<any>(`${this.paymentUrl}/history/customer/${loanAccountId}`, {
      params: { page, size }
    }).pipe(timeout(20000));
  }

  generateSchedule(loanAccountId: number) {
    return this.http.post<any>(`${this.emiUrl}/generate/${loanAccountId}`, {});
  }
}
