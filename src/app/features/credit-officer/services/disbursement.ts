
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../models/sanction.model';

import {
  DisbursementRequest,
  DisbursementResponse
} from '../models/disbursement.model';

@Injectable({
  providedIn: 'root'
})
export class DisbursementService {

  private http = inject(HttpClient);

  private baseUrl =
    'http://localhost:8080/api/v1/disbursements';

  // 1. Create disbursement with selected date and bank partner
  createDisbursement(
    request: DisbursementRequest
  ): Observable<ApiResponse<DisbursementResponse>> {

    return this.http.post<ApiResponse<DisbursementResponse>>(
      this.baseUrl,
      request
    );
  }

  // 2. Complete pending disbursement
  completeDisbursement(
    disbursementId: number
  ): Observable<ApiResponse<DisbursementResponse>> {

    return this.http.post<ApiResponse<DisbursementResponse>>(
      `${this.baseUrl}/${disbursementId}/complete`,
      null
    );
  }

  // 3. Fetch latest disbursement for a deal
  getLatestDisbursement(
    dealId: number
  ): Observable<ApiResponse<DisbursementResponse>> {

    return this.http.get<ApiResponse<DisbursementResponse>>(
      `${this.baseUrl}/deal/${dealId}/latest`
    );
  }

  // 4. Fetch disbursement by ID
  getDisbursementById(
    disbursementId: number
  ): Observable<ApiResponse<DisbursementResponse>> {

    return this.http.get<ApiResponse<DisbursementResponse>>(
      `${this.baseUrl}/${disbursementId}`
    );
  }
}
