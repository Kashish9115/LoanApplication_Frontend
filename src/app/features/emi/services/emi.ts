import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { timeout } from 'rxjs';




@Injectable({
  providedIn: 'root',
})
export class Emi {

 
 private  apiUrl = `${environment.apiUrl}/api/emi`;

 constructor(private http:HttpClient){}

  
  // getSchedule(loanAccountId: number, page = 0, size = 10) {
  //   return this.http.get<any>(
  //     `${this.apiUrl}/getuseremi/account/${loanAccountId}`,
  //     { params: { page, size } }
  //   ).pipe(timeout(15000));
  // }

  getSchedule(
  loanAccountId: number,
  page: number = 0,
  size: number = 10
) {
  return this.http.get<any>(
    `${this.apiUrl}/getuseremi/account/${loanAccountId}?page=${page}&size=${size}`
  );
}

   getBreakdown(emiScheduleId: number) {
    return this.http.get<any>(
      `${this.apiUrl}/breakdown/${emiScheduleId}`
    );
  }



generateSchedule(loanAccountId: number) {
    return this.http.post<any>(
      `${this.apiUrl}/generate/${loanAccountId}`,
      {}
    );
  }


 

}
