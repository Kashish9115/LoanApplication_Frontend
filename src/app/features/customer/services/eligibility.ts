import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  EligibilityRequest,
  EligibilityResponse
} from '../models/eligibility.model';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CibilReport {
  cibilReportId: number;
  customerId: number;
  panNo: string | null;
  cibilScore: number | null;
  checkDate: string | null;
  status: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class EligibilityService {
  private readonly http = inject(HttpClient);

  private readonly eligibilityUrl =
    'http://localhost:8080/api/v1/eligibility';

  private readonly cibilUrl =
    'http://localhost:8080/api/customer/cibilscore';

  calculateEligibility(
    request: EligibilityRequest
  ): Observable<ApiResponse<EligibilityResponse>> {
    return this.http.post<ApiResponse<EligibilityResponse>>(
      `${this.eligibilityUrl}/calculate`,
      request
    );
  }

  getLatestCibil(
    customerId: number
  ): Observable<ApiResponse<CibilReport>> {
    return this.http.get<ApiResponse<CibilReport>>(
      `${this.cibilUrl}/${customerId}`
    );
  }

  getLatestEligibility(
    customerId: number
  ): Observable<ApiResponse<EligibilityResponse>> {
    return this.http.get<ApiResponse<EligibilityResponse>>(
      `${this.eligibilityUrl}/${customerId}`
    );
  }
}