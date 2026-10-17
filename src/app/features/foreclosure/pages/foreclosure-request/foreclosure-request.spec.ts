import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForeclosureRequest } from './foreclosure-request';

describe('ForeclosureRequest', () => {
  let component: ForeclosureRequest;
  let fixture: ComponentFixture<ForeclosureRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForeclosureRequest],
    }).compileComponents();

    fixture = TestBed.createComponent(ForeclosureRequest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
