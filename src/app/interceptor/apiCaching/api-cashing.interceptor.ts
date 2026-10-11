import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { of, tap } from 'rxjs';

export const apiCashingInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // Never run cache logic on the server — sessionStorage is browser-only
  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  // TODO: wire up real caching routes here
  return next(req);
};

