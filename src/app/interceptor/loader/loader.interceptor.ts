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
    url.includes('/verify-otp') ||
    url.includes('/send-otp') ||
    url.includes('/wishlist') ||
    url.includes('/getalleventsbyuser') ||
    url.includes('/getAllEventsByUser') ||
    url.includes('/review/geteventreviews') ||
    url.includes('/review/getEventReviews') ||
    url.includes('/verifyselfieprofile') ||
    url.includes('/acceptjoinrequest') ||
    url.includes('/rejectjoineventrequest') ||
    url.includes('/uploadeventgalleryimages') ||
    url.includes('/getAllEventsImagesByUser') ||
    url.includes('/getAllAttendedEvents') ||
    url.includes('/removeeventgalleryimage') ||
    url.includes('/toggleWishlistEvent') ||
    req.headers.has('X-Skip-Global-Loader') ||
    req.headers.has('x-skip-global-loader');

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
