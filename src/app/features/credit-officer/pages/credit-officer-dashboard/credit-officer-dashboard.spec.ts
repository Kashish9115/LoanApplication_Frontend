import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditOfficerDashboard } from './credit-officer-dashboard';

describe('CreditOfficerDashboard', () => {
  let component: CreditOfficerDashboard;
  let fixture: ComponentFixture<CreditOfficerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditOfficerDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(CreditOfficerDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
