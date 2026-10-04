import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SafetyAgreementCardComponent } from './safety-agreement-card.component';

describe('SafetyAgreementCardComponent', () => {
  let component: SafetyAgreementCardComponent;
  let fixture: ComponentFixture<SafetyAgreementCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SafetyAgreementCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SafetyAgreementCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
