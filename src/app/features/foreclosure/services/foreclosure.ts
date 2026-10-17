
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoanAccountDetails {
  loanAccountId: number;
  loanAccountNo: string;
  customerId: number;
  outstandingAmount: number;
  nextEmiDate: string;
}

export interface ForeclosureRequest {
  requestId: number;
  loanAccountId: number;
  loanAccountNo?: string;
  foreClosureType: string;
  foreClosureAmount: number;
  status: string;
  expectedClosureDate: string;
  reason: string;
}

@Injectable({
  providedIn: 'root'
})
export class ForeclosureService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api';

  getActiveLoanAccounts(customerId: number): Observable<ApiResponse<number[]>> {
    const params = new HttpParams().set('customerId', customerId);
    return this.http.get<ApiResponse<number[]>>(
      `${this.baseUrl}/customer/loanAccount/getAllActiveLoanAccount`,
      { params }
    );
  }

  getLoanAccountDetails(
    loanAccountId: number
  ): Observable<ApiResponse<LoanAccountDetails>> {
    return this.http.get<ApiResponse<LoanAccountDetails>>(
      `${this.baseUrl}/customer/loanAccount/${loanAccountId}`
    );
  }

  submitFullClosure(
    loanAccountId: number,
    request: { expectedClosureDate: string; reason: string }
  ): Observable<ApiResponse<ForeclosureRequest>> {
    return this.http.post<ApiResponse<ForeclosureRequest>>(
      `${this.baseUrl}/customer/loanAccount/${loanAccountId}/fullclosure`,
      request
    );
  }

  submitPartialClosure(
    loanAccountId: number,
    request: {
      months: number;
      expectedClosureDate: string;
      reason: string;
    }
  ): Observable<ApiResponse<ForeclosureRequest>> {
    return this.http.post<ApiResponse<ForeclosureRequest>>(
      `${this.baseUrl}/customer/loanAccount/${loanAccountId}/partialclosure`,
      request
    );
  }

 getCustomerRequests(
  customerId: number,
  page: number,
  size: number
): Observable<ApiResponse<any>> {
  return this.http.get<ApiResponse<any>>(
    `${this.baseUrl}/customer/foreclosure/requests`,
    {
      params: {
        customerId: customerId,
        page: page,
        size: size
      }
    }
  );
}
}
