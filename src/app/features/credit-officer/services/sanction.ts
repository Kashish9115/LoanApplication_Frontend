
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  ApiResponse,
  OfficerLoanDeal,
  SanctionResponse
} from '../models/sanction.model';

@Injectable({
  providedIn: 'root'
})
export class SanctionService {

  private http = inject(HttpClient);

  private baseUrl = 'http://localhost:8080/api/v1';

  // Fetch a loan application by Deal ID
  getLoanDeal(
    dealId: number
  ): Observable<ApiResponse<OfficerLoanDeal>> {

    return this.http.get<ApiResponse<OfficerLoanDeal>>(
      `${this.baseUrl}/loan-deals/${dealId}`
    );
  }

  // Generate sanction letter
  generateSanction(
    dealId: number
  ): Observable<ApiResponse<SanctionResponse>> {

    return this.http.post<ApiResponse<SanctionResponse>>(
      `${this.baseUrl}/sanctions/deal/${dealId}`,
      null
    );
  }

  // Fetch existing sanction using Deal ID
  getSanctionByDeal(
    dealId: number
  ): Observable<ApiResponse<SanctionResponse>> {

    return this.http.get<ApiResponse<SanctionResponse>>(
      `${this.baseUrl}/sanctions/deal/${dealId}`
    );
  }

  // Fetch sanction using Sanction ID
  getSanctionById(
    sanctionId: number
  ): Observable<ApiResponse<SanctionResponse>> {

    return this.http.get<ApiResponse<SanctionResponse>>(
      `${this.baseUrl}/sanctions/${sanctionId}`
    );
  }

  // NEW: Fetch complete sanction history
  getAllSanctions(): Observable<ApiResponse<SanctionResponse[]>> {

    return this.http.get<ApiResponse<SanctionResponse[]>>(
      `${this.baseUrl}/sanctions`
    );
  }
}
