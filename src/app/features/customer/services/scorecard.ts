
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../models/eligibility.model';
import { ScorecardResponse } from '../models/scorecard.model';

@Injectable({
  providedIn: 'root'
})
export class ScorecardService {

  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:8080/api/v1/scorecards';

  generateScorecard(
    customerId: number
  ): Observable<ApiResponse<ScorecardResponse>> {

    return this.http.post<ApiResponse<ScorecardResponse>>(
      `${this.apiUrl}/${customerId}/generate`,
      null
    );
  }

  getLatestScorecard(
    customerId: number
  ): Observable<ApiResponse<ScorecardResponse>> {

    return this.http.get<ApiResponse<ScorecardResponse>>(
      `${this.apiUrl}/${customerId}`
    );
  }
}
