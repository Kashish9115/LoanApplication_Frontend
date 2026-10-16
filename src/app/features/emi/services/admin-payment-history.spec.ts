import { TestBed } from '@angular/core/testing';

import { AdminPaymentHistory } from './admin-payment-history';

describe('AdminPaymentHistory', () => {
  let service: AdminPaymentHistory;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminPaymentHistory);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
