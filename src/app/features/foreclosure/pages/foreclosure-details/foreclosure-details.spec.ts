import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForeclosureDetails } from './foreclosure-details';

describe('ForeclosureDetails', () => {
  let component: ForeclosureDetails;
  let fixture: ComponentFixture<ForeclosureDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForeclosureDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(ForeclosureDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
