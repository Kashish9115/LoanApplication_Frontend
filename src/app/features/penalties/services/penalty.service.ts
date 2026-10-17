import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PageResponse, PenaltyCharge } from '../models/penalty.model';

@Injectable({ providedIn: 'root' })
export class PenaltyService {
  private readonly baseUrl = `${environment.apiUrl}/api/penalties`;

  constructor(private readonly http: HttpClient) {}

  getByLoanAccount(loanAccountId: number, page = 0, size = 10) {
    return this.http.get<PageResponse<PenaltyCharge>>(
      `${this.baseUrl}/account/${loanAccountId}`, { params: { page, size } }
    ).pipe(timeout(20000));
  }

  getAllForAdmin(page = 0, size = 10) {
    return this.http.get<PageResponse<PenaltyCharge>>(
      `${this.baseUrl}/admin/all`, { params: { page, size } }
    ).pipe(timeout(20000));
  }

  // Requires a matching waiver endpoint in the Spring Boot backend.
  requestWaiver(penaltyChargeId: number, reason: string) {
    return this.http.post<any>(`${this.baseUrl}/${penaltyChargeId}/waiver`, { reason }).pipe(timeout(20000));
  }
}
