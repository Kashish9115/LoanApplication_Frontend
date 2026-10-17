
export interface ScorecardResponse {
  scoreCardId: number;
  customerId: number;
  cibilScore: number;
  cibilStatus: string;
  riskCategory: string;
  eligibleLoanAmount: number;
  approvalType: string;
  currentStatus: string;
  rejectionReason: string | null;
  appliedDate: string;
}
