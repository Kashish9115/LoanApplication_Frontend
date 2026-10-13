import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditOfficerSidebar } from './credit-officer-sidebar';

describe('CreditOfficerSidebar', () => {
  let component: CreditOfficerSidebar;
  let fixture: ComponentFixture<CreditOfficerSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditOfficerSidebar],
    }).compileComponents();

    fixture = TestBed.createComponent(CreditOfficerSidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
