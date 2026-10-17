
export interface DisbursementRequest {
  dealId: number;
  disbursementDate: string;
  bankName: string;
}

export type DisbursementStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';

export type BankPartner =
  | 'Bank Of India'
  | 'HDFC Bank'
  | 'ICICI Bank'
  | 'Bank Of Maharashtra'
  | 'State Bank Of India'
  | 'Axis Bank';

export interface DisbursementResponse {
  disbursementId: number;
  dealId: number;
  customerId: number;

  disbursedAmount: number;

  bankName: string;
  bankAccountNumber: string;
  accountHolderName: string;
  ifscCode: string;

  disbursementStatus: DisbursementStatus;
  dealStatus: string;

  disbursedAt: string | null;
  message: string;
}
