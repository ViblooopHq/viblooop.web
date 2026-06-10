import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth/auth.service';
import { filter, map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService)
  const router = inject(Router)

  return authService.isAuthInitialized$.pipe(
    filter(initialized => initialized === true),
    take(1),
    map(() => {
      if (authService.isLoggedIn()) {
        return true;
      }
      return false;
    })
  );
};
