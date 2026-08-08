import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { CreateEventFormService } from './create-event-form.service';

describe('CreateEventFormService', () => {
  let service: CreateEventFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CreateEventFormService, provideHttpClient(), provideRouter([])]
    });
    service = TestBed.inject(CreateEventFormService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });
});
