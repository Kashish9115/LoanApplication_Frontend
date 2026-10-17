
export type LoanType = 'HOME_LOAN' | 'VEHICLE_LOAN';

export type LoanDealStatus =
  | 'SUBMITTED'
  | 'MANUAL_REVIEW'
  | 'AUTO_APPROVED'
  | 'APPROVED'
  | 'REJECTED'
  | 'SANCTIONED'
  | 'DISBURSEMENT_PENDING'
  | 'DISBURSED';

export interface LoanDealRequest {
  customerId: number;
  loanType: LoanType;
  requestedLoanAmount: number;
  tenureMonths: number;
  emiDay: number;
  bankName: string;
  bankAccountNumber: string;
  accountHolderName: string;
  ifscCode: string;
}

export interface LoanDealResponse extends LoanDealRequest {
  dealId: number;
  eligibleLoanAmount: number;
  approvedAmount: number | null;
  cibilScore: number;
  cibilStatus: string;
  dealStatus: LoanDealStatus;

  // Optional for compatibility with existing saved deals
  preferredDisbursementDate?: string | null;
}
