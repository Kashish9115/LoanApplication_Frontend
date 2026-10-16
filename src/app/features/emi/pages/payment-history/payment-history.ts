import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PaymentHistory as paymentHistoryService } from '../../services/payment-history';
@Component({
  selector: 'app-payment-history',
  imports: [CommonModule],
  templateUrl: './payment-history.html',
  styleUrl: './payment-history.scss',
})
export class PaymentHistory  implements OnInit {


loanAccountId = 3;
payments: any[] = [];
currentPage = 0;
pageSize = 10;
totalPages = 0;

constructor(private paymentHistoryService: paymentHistoryService) {
}


ngOnInit(): void {
  this.loadPayments();
}
loadPayments() {
  this.paymentHistoryService
    .getPaymentHistoryOfUser(
      this.loanAccountId,
      this.currentPage,
      this.pageSize
    )
    .subscribe({
      next: (response:any) => {
        this.payments = response.content || response;
        this.totalPages = response.totalPages || 0;
      },
      error: (error:any) => console.error(error)
    });
}

previousPage() {
  if (this.currentPage > 0) {
    this.currentPage--;
    this.loadPayments();
  }
}

nextPage() {
  if (this.currentPage < this.totalPages - 1) {
    this.currentPage++;
    this.loadPayments();
  }
}
}
