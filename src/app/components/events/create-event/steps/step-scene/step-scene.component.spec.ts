import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { StepSceneComponent } from './step-scene.component';
import { CreateEventFormService } from '../../state/create-event-form.service';
import { CreateEventImageUploadService } from '../../state/create-event-image-upload.service';

describe('StepSceneComponent', () => {
  let component: StepSceneComponent;
  let fixture: ComponentFixture<StepSceneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepSceneComponent],
      providers: [CreateEventFormService, CreateEventImageUploadService, provideHttpClient(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(StepSceneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
