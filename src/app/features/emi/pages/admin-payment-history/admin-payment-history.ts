import { CommonModule } from '@angular/common';
import { afterNextRender, Component } from '@angular/core';
import { AdminPaymentHistory as AdminPaymentHistoryService } from '../../services/admin-payment-history';

@Component({
  selector: 'app-admin-payment-history',
  imports: [CommonModule],
  templateUrl: './admin-payment-history.html',
  styleUrl: './admin-payment-history.scss',
})
export class AdminPaymentHistory {


payments: any[] = [];
currentPage = 0;
pageSize = 10;
totalPages = 0;

constructor(private adminPaymentHistoryService: AdminPaymentHistoryService) {
  afterNextRender(() => this.loadpaymentHistory());
}


  loadpaymentHistory() {

this.adminPaymentHistoryService.getAllPaymentHistory(this.currentPage, this.pageSize).subscribe({
  next: (response:any) => {
    this.payments = response?.content ?? (Array.isArray(response) ? response : []);
    this.totalPages = response?.totalPages ?? 0;



        
  },
  error: (error:any) => console.error(error)
});
  } 




  previousPage() {
  if (this.currentPage > 0) {
    this.currentPage--;
    this.loadpaymentHistory()
  }
}

nextPage() {
  if (this.currentPage < this.totalPages - 1) {
    this.currentPage++;
    this.loadpaymentHistory()
  }
}

}
