import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingSelectorComponent } from './pricing-selector.component';

describe('PricingSelectorComponent', () => {
  let component: PricingSelectorComponent;
  let fixture: ComponentFixture<PricingSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricingSelectorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PricingSelectorComponent);
    fixture.componentRef.setInput('cost', 'Free');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
