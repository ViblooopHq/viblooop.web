import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { StepVibeComponent } from './step-vibe.component';
import { CreateEventFormService } from '../../state/create-event-form.service';

describe('StepVibeComponent', () => {
  let component: StepVibeComponent;
  let fixture: ComponentFixture<StepVibeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepVibeComponent],
      providers: [CreateEventFormService, provideHttpClient(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(StepVibeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
