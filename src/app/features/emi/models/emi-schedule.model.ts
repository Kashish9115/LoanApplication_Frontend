export interface EmiSchedule {
  emiScheduleId: number;
  installmentNo: number;
  dueDate: string;
  emi: number;
  principalAmount: number;
  interestAmount: number;
  openingBalance: number;
  closingBalance: number;
  paymentStatus: string;
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