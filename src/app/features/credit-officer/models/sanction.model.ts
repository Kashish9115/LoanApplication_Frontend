
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface SanctionResponse {
  sanctionId: number;
  dealId: number;
  customerId: number;
  loanType: 'HOME_LOAN' | 'VEHICLE_LOAN';
  approvedLoanAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  emiDay: number;
  dealStatus: string;
  createdAt: string;
  message: string;
}

// NEW: Response type for the complete sanction history API
export type SanctionHistoryResponse = ApiResponse<SanctionResponse[]>;

export interface OfficerLoanDeal {
  dealId: number;
  customerId: number;
  loanType: 'HOME_LOAN' | 'VEHICLE_LOAN';
  requestedLoanAmount: number;
  eligibleLoanAmount: number;
  approvedAmount: number | null;
  tenureMonths: number;
  emiDay: number;
  bankName: string;
  bankAccountNumber: string;
  accountHolderName: string;
  preferredDisbursementDate: string;
  cibilScore: number;
  cibilStatus: string;
  dealStatus: string;
  ifscCode: string;
}
