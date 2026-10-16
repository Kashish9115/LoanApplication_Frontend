import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AdminPaymentHistory {

   private  apiUrl = `${environment.apiUrl}/api/payments`;
  
   constructor(private http:HttpClient){}
  

   getAllPaymentHistory(page = 0, size = 10){
    return this.http.get<any>(`${this.apiUrl}/history/admin/all`, {
      params: { page, size },
    });
   }



}
