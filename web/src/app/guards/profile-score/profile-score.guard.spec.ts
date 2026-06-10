import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { profileScoreGuard } from './profile-score.guard';

describe('profileScoreGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => profileScoreGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
