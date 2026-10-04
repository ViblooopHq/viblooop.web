import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { StepReviewComponent } from './step-review.component';
import { CreateEventFormService } from '../../state/create-event-form.service';
import { CreateEventImageUploadService } from '../../state/create-event-image-upload.service';

describe('StepReviewComponent', () => {
  let component: StepReviewComponent;
  let fixture: ComponentFixture<StepReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepReviewComponent],
      providers: [CreateEventFormService, CreateEventImageUploadService, provideHttpClient(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(StepReviewComponent);
    fixture.componentRef.setInput('isSubmittingEvent', false);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
