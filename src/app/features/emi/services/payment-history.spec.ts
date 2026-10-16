import { TestBed } from '@angular/core/testing';

import { PaymentHistory } from './payment-history';

describe('PaymentHistory', () => {
  let service: PaymentHistory;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentHistory);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
