import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../shared/services/auth/auth.service';
import { LoaderService } from '../../shared/services/loader/loader.service';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';

let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

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

        // If refresh or logout fails with 401, don't loop
        if (req.url.includes('/refresh-access-token') || req.url.includes('/logout')) {
          authService.logout(false);
          return throwError(() => error);
        }

        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);
          loaderService.show();

          return authService.refreshToken().pipe(
            switchMap(() => {
              isRefreshing = false;
              loaderService.hide();
              refreshTokenSubject.next(true);
              return next(clonedReq);
            }),
            catchError((err) => {
              isRefreshing = false;
              loaderService.hide();
              refreshTokenSubject.next(false);
              authService.logout(false);
              return throwError(() => err);
            })
          );
        } else {
          return refreshTokenSubject.pipe(
            filter(result => result !== null),
            take(1),
            switchMap((success) => {
              if (success) {
                return next(clonedReq);
              } else {
                return throwError(() => new Error('Token refresh failed'));
              }
            })
          );
        }
      }
      return throwError(() => error);
    })
  );
}
