
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Cibilscore {

  private http = inject(HttpClient);

  private baseUrl = 'http://localhost:8080/api/customer/cibilscore';


  generateCibilScore(customerId: number) {
    return this.http.post<any>(
      `${this.baseUrl}/${customerId}`,
      {}
    );
  }

  getCibilScore(customerId: number) {
    return this.http.get<any>(
      `${this.baseUrl}/${customerId}`
    );
  }
}
