import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { StepEssentialsComponent } from './step-essentials.component';
import { CreateEventFormService } from '../../state/create-event-form.service';

describe('StepEssentialsComponent', () => {
  let component: StepEssentialsComponent;
  let fixture: ComponentFixture<StepEssentialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepEssentialsComponent],
      providers: [CreateEventFormService, provideHttpClient(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(StepEssentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
