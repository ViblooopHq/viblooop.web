import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { LoaderService } from '../../shared/services/loader/loader.service';
import { finalize } from 'rxjs';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);
  const loaderService = inject(LoaderService);
  const method = req.method.toUpperCase();
  const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  const url = req.url.toLowerCase();
  const isExcluded =
    url.includes('createevent') ||
    url.includes('wishlist') ||
    req.headers.has('X-Skip-Global-Loader');

  const shouldShowLoader = isBrowser && isMutating && !isExcluded;

  if (shouldShowLoader) {
    loaderService.show();
  }

  return next(req).pipe(
    finalize(() => {
      if (shouldShowLoader) {
        loaderService.hide();
      }
    })
  );
};
