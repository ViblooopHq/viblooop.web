import { TestBed } from '@angular/core/testing';
import { CanDeactivateFn } from '@angular/router';

import { CanComponentDeactivate, unsavedChangeGuard } from './unsave-change.guard';

describe('unsavedChangeGuard', () => {
  const executeGuard: CanDeactivateFn<CanComponentDeactivate> = (...guardParameters) => 
      TestBed.runInInjectionContext(() => unsavedChangeGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
