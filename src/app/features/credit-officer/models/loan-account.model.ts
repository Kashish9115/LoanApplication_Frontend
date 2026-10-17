export interface LoanAccountResponse {
  loanAccountId: number;
  dealId: number;
  customerId: number;
  loanAccountNo: string;
  loanType: 'HOME_LOAN' | 'VEHICLE_LOAN' | string;
  loanAmount: number;
  outstandingAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  emiDay: number;
  status: string;
  createdAt: string;
  message?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}