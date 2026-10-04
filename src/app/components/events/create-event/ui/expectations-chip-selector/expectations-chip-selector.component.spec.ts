import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpectationsChipSelectorComponent } from './expectations-chip-selector.component';

describe('ExpectationsChipSelectorComponent', () => {
  let component: ExpectationsChipSelectorComponent;
  let fixture: ComponentFixture<ExpectationsChipSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpectationsChipSelectorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpectationsChipSelectorComponent);
    fixture.componentRef.setInput('options', ['Live DJ', 'Drinks']);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
