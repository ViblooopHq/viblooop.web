import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudiencePreferenceSelectorComponent } from './audience-preference-selector.component';

describe('AudiencePreferenceSelectorComponent', () => {
  let component: AudiencePreferenceSelectorComponent;
  let fixture: ComponentFixture<AudiencePreferenceSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudiencePreferenceSelectorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AudiencePreferenceSelectorComponent);
    fixture.componentRef.setInput('mixType', 'open');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
