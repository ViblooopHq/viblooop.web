import { CanActivateFn } from '@angular/router';
import { CompleteProfileService } from '../../shared/services/popup/complete-profile.service';
import { inject } from '@angular/core';
import { map } from 'rxjs';

export const profileScoreGuard: CanActivateFn = (route, state) => {
  const cps = inject(CompleteProfileService);
  return cps.checkProfileAndShowPopup().pipe(
    map((isComplete) => {
      if (isComplete) {
        return true; // allow
      } else {
        return false;
      }
    })
  );
};
