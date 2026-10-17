import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyforeclosureList } from './myforeclosure-list';

describe('MyforeclosureList', () => {
  let component: MyforeclosureList;
  let fixture: ComponentFixture<MyforeclosureList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyforeclosureList],
    }).compileComponents();

    fixture = TestBed.createComponent(MyforeclosureList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
