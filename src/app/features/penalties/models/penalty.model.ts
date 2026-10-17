export interface PenaltyCharge {
  penaltyChargeId: number;
  loanAccountId: number;
  emiScheduleId: number;
  penaltyAmount: number;
  reason: string;
  status: 'APPLIED' | 'PAID' | 'WAIVED' | string;
  createdAt: string;
  responseMessage?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber?: number;
  pageSize?: number;
  totalElements?: number;
  totalPages?: number;
}
