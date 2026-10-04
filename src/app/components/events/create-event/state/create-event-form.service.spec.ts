import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { CreateEventFormService } from './create-event-form.service';
import { CREATE_EVENT_TYPE_CONFIGS } from '../create-event.config';

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

  it('provides category-specific title and location copy', () => {
    expect(CREATE_EVENT_TYPE_CONFIGS.event.titleFieldLabel).toBe('Party Title');
    expect(CREATE_EVENT_TYPE_CONFIGS.play.titleFieldLabel).toBe('Game Title');
    expect(CREATE_EVENT_TYPE_CONFIGS.escape.titleFieldLabel).toBe('Trip Title');
    expect(CREATE_EVENT_TYPE_CONFIGS.hangout.titleFieldLabel).toBe('Hangout Title');

    Object.values(CREATE_EVENT_TYPE_CONFIGS).forEach(config => {
      expect(config.addressFieldPlaceholder.toLowerCase()).not.toContain('flat');
    });
  });

  it('requires an end time only for hangouts', () => {
    expect(CREATE_EVENT_TYPE_CONFIGS.hangout.requiresEndTime).toBeTrue();
    expect(CREATE_EVENT_TYPE_CONFIGS.event.requiresEndTime).toBeFalse();
    expect(CREATE_EVENT_TYPE_CONFIGS.play.requiresEndTime).toBeFalse();
    expect(CREATE_EVENT_TYPE_CONFIGS.escape.requiresEndTime).toBeFalse();
  });
});
