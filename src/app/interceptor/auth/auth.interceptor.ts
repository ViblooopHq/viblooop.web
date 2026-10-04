import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../shared/services/auth/auth.service';
import { LoaderService } from '../../shared/services/loader/loader.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const cloned = req.clone({
    withCredentials: true
  });
  return next(cloned);
};

export const authInterceptorWithRefresh: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const loaderService = inject(LoaderService);

  const clonedReq = req.clone({ withCredentials: true });

  return next(clonedReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Auth check endpoints, OTP, refresh or logout: do not attempt token refresh or trigger logout splash
        if (
          req.url.includes('/me') ||
          req.url.includes('/refresh-access-token') ||
          req.url.includes('/logout') ||
          req.url.includes('/login') ||
          req.url.includes('/send-otp') ||
          req.url.includes('/verify-otp')
        ) {
          return throwError(() => error);
        }

        loaderService.show();

        return authService.refreshToken().pipe(
          switchMap(() => {
            loaderService.hide();
            return next(clonedReq);
          }),
          catchError((err) => {
            loaderService.hide();
            authService.logout(false, false);
            return throwError(() => err);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
