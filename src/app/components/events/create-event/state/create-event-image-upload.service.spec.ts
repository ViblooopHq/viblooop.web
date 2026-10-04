import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { CreateEventImageUploadService } from './create-event-image-upload.service';

describe('CreateEventImageUploadService', () => {
  let service: CreateEventImageUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CreateEventImageUploadService, provideHttpClient(), provideRouter([])]
    });
    service = TestBed.inject(CreateEventImageUploadService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });
});
