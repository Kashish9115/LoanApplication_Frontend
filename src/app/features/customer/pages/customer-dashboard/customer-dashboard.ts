import { Component } from '@angular/core';
import { CustomerSidebar } from '../../../../core/theme/customer-sidebar/customer-sidebar';

@Component({
  selector: 'app-customer-dashboard',
  imports: [CustomerSidebar],
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.scss',
})
export class CustomerDashboard {}
