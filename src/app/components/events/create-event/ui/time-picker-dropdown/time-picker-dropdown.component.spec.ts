import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimePickerDropdownComponent } from './time-picker-dropdown.component';

describe('TimePickerDropdownComponent', () => {
  let component: TimePickerDropdownComponent;
  let fixture: ComponentFixture<TimePickerDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimePickerDropdownComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TimePickerDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
