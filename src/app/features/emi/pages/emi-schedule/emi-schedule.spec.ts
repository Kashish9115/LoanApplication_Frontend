import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmiSchedule } from './emi-schedule';

describe('EmiSchedule', () => {
  let component: EmiSchedule;
  let fixture: ComponentFixture<EmiSchedule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmiSchedule],
    }).compileComponents();

    fixture = TestBed.createComponent(EmiSchedule);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('allows paying the current-month EMI before its due date', () => {
    expect(component.canPay({ paymentStatus: 'PENDING', dueDate: component.today() })).toBe(true);
  });

  it('does not allow paying an already paid EMI', () => {
    expect(component.canPay({ paymentStatus: 'PAID', dueDate: component.today() })).toBe(false);
  });

  it('does not allow paying an overdue EMI, even in the current month', () => {
    const now = new Date();
    if (now.getDate() > 1) {
      const firstOfMonth = `${component.today().slice(0, 7)}-01`;
      expect(component.getStatus({ paymentStatus: 'PENDING', dueDate: firstOfMonth })).toBe('OVERDUE');
      expect(component.canPay({ paymentStatus: 'PENDING', dueDate: firstOfMonth })).toBe(false);
    }
  });

  it('does not allow paying an installment explicitly marked overdue', () => {
    expect(component.canPay({ paymentStatus: 'OVERDUE', dueDate: component.today() })).toBe(false);
  });

  it('does not offer payment on a previous-month overdue EMI', () => {
    const previousMonth = new Date();
    previousMonth.setDate(1);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const dueDate = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}-01`;

    expect(component.canPay({ paymentStatus: 'PENDING', dueDate })).toBe(false);
  });

  it('offers payment on a future-month pending EMI', () => {
    const nextMonth = new Date();
    nextMonth.setDate(1);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const dueDate = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`;

    expect(component.canPay({ paymentStatus: 'PENDING', dueDate })).toBe(true);
  });

  it('shows the payment loading state only for the selected EMI', () => {
    component.paymentEmiId = 12;

    expect(component.isPaymentEmi({ emiScheduleId: 12 })).toBe(true);
    expect(component.isPaymentEmi({ emiScheduleId: 13 })).toBe(false);
  });
});
