import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PaymentHistory {


  private  apiUrl = `${environment.apiUrl}/api/payments`;

 constructor(private http:HttpClient){}



  getPaymentHistoryOfUser(loanAccountId :number, page=0, size=10
  
  ){
    return this.http.get<any>(`${this.apiUrl}/history/customer/${loanAccountId}`,
{ params: { page, size } })
  }
}
