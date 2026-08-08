import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CapacitySelectorComponent } from './capacity-selector.component';

describe('CapacitySelectorComponent', () => {
  let component: CapacitySelectorComponent;
  let fixture: ComponentFixture<CapacitySelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CapacitySelectorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CapacitySelectorComponent);
    fixture.componentRef.setInput('limited', true);
    fixture.componentRef.setInput('value', 10);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
