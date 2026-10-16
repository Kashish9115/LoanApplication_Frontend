import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPaymentHistory } from './admin-payment-history';

describe('AdminPaymentHistory', () => {
  let component: AdminPaymentHistory;
  let fixture: ComponentFixture<AdminPaymentHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPaymentHistory],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPaymentHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
