export interface EligibilityRequest {
  customerId: number;
  cibilScore: number;
}

export interface EligibilityResponse {
  eligibilityId: number;
  customerId: number;
  customerName: string;
  panNo: string | null;
  monthlyIncome: number;
  cibilScore: number;
  cibilStatus: string;
  eligible: boolean;
  eligibleLoanAmount: number;
  rejectionReason: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}