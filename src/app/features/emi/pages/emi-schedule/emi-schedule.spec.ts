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
});
