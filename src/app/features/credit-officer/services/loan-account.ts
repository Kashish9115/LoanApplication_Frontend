import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../models/sanction.model';

import {
  LoanAccountResponse,
  PageResponse
} from '../models/loan-account.model';

@Injectable({
  providedIn: 'root'
})
export class LoanAccountService {

  private readonly http = inject(HttpClient);

  private readonly baseUrl =
    'http://localhost:8080/api/v1/loan-accounts';

  // 1. Create loan account after successful disbursement
  createLoanAccount(
    dealId: number
  ): Observable<ApiResponse<LoanAccountResponse>> {

    return this.http.post<ApiResponse<LoanAccountResponse>>(
      `${this.baseUrl}/deal/${dealId}`,
      null
    );
  }

  // 2. Fetch existing loan account using Deal ID
  getLoanAccountByDealId(
    dealId: number
  ): Observable<ApiResponse<LoanAccountResponse>> {

    return this.http.get<ApiResponse<LoanAccountResponse>>(
      `${this.baseUrl}/deal/${dealId}`
    );
  }

  // 3. Fetch loan account using Loan Account ID
  getLoanAccountById(
    loanAccountId: number
  ): Observable<ApiResponse<LoanAccountResponse>> {

    return this.http.get<ApiResponse<LoanAccountResponse>>(
      `${this.baseUrl}/${loanAccountId}`
    );
  }

  // 4. Fetch latest loan account of a customer
  getLatestLoanAccount(
    customerId: number
  ): Observable<ApiResponse<LoanAccountResponse>> {

    return this.http.get<ApiResponse<LoanAccountResponse>>(
      `${this.baseUrl}/customer/${customerId}/latest`
    );
  }

  // 5. Fetch ALL loan accounts with server-side pagination
  // API: GET /api/v1/loan-accounts?page=0&size=10
  getAllLoanAccounts(
    page: number = 0,
    size: number = 10
  ): Observable<ApiResponse<PageResponse<LoanAccountResponse>>> {

    return this.http.get<
      ApiResponse<PageResponse<LoanAccountResponse>>
    >(
      `${this.baseUrl}?page=${page}&size=${size}`
    );
  }
}