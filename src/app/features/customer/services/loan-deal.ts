
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../models/eligibility.model';
import {
  LoanDealRequest,
  LoanDealResponse
} from '../models/loan-deal.model';

@Injectable({
  providedIn: 'root'
})
export class LoanDealService {

  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:8080/api/v1/loan-deals';

  createLoanDeal(
    request: LoanDealRequest
  ): Observable<ApiResponse<LoanDealResponse>> {

    return this.http.post<ApiResponse<LoanDealResponse>>(
      this.apiUrl,
      request
    );
  }

  getLoanDeal(
    dealId: number
  ): Observable<ApiResponse<LoanDealResponse>> {

    return this.http.get<ApiResponse<LoanDealResponse>>(
      `${this.apiUrl}/${dealId}`
    );
  }

  getLatestLoanDeal(
    customerId: number
  ): Observable<ApiResponse<LoanDealResponse>> {

    return this.http.get<ApiResponse<LoanDealResponse>>(
      `${this.apiUrl}/customer/${customerId}/latest`
    );
  }
}
