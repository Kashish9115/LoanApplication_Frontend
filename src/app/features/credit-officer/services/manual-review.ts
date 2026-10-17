
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';

import { ApiResponse } from '../models/sanction.model';

export interface ManualReviewDeal {
  dealId: number;
  customerId: number;
  loanType: 'HOME_LOAN' | 'VEHICLE_LOAN';
  requestedLoanAmount: number;
  eligibleLoanAmount: number;
  approvedAmount: number | null;
  tenureMonths: number;
  emiDay: number;
  bankName: string;
  bankAccountNumber: string;
  accountHolderName: string;
  preferredDisbursementDate: string | null;
  cibilScore: number;
  cibilStatus: string;
  dealStatus?: string;
  status?: string;
  ifscCode: string;
}

export interface ManualReviewPage<T> {
  content: T[];
  pageNumber?: number;
  pageSize?: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
}

export interface DealReviewResponse {
  reviewId?: number;
  dealId: number;
  customerId?: number;
  officerId: number;
  reviewStatus?: 'APPROVED' | 'REJECTED';
  status?: 'APPROVED' | 'REJECTED';
  dealStatus?: string;
  requestedLoanAmount?: number;
  approvedAmount?: number | null;
  message?: string;
}

export interface ReviewRequest {
  dealId: number;
  officerId: number;
  status: 'APPROVED' | 'REJECTED';
}

@Injectable({
  providedIn: 'root'
})
export class ManualReview {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/v1';
  private readonly requestTimeoutMs = 15000;

  getManualReviewDeals(
    page = 0,
    size = 10
  ): Observable<ApiResponse<ManualReviewPage<ManualReviewDeal>>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<ApiResponse<ManualReviewPage<ManualReviewDeal>>>(
      `${this.baseUrl}/loan-deals/manual-review`,
      { params }
    ).pipe(timeout(this.requestTimeoutMs));
  }

  getLoanDeal(
    dealId: number
  ): Observable<ApiResponse<ManualReviewDeal>> {
    return this.http.get<ApiResponse<ManualReviewDeal>>(
      `${this.baseUrl}/loan-deals/${dealId}`
    ).pipe(timeout(this.requestTimeoutMs));
  }

  reviewLoanDeal(
    request: ReviewRequest
  ): Observable<ApiResponse<DealReviewResponse>> {
    return this.http.post<ApiResponse<DealReviewResponse>>(
      `${this.baseUrl}/deal-reviews`,
      request
    ).pipe(timeout(this.requestTimeoutMs));
  }

  getLatestReview(
    dealId: number
  ): Observable<ApiResponse<DealReviewResponse>> {
    return this.http.get<ApiResponse<DealReviewResponse>>(
      `${this.baseUrl}/deal-reviews/deal/${dealId}/latest`
    ).pipe(timeout(this.requestTimeoutMs));
  }
}
