import { isPlatformServer } from '@angular/common';
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Environment } from '../../../environment';

export const ssrApiInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformServer(platformId) || !req.url.startsWith(Environment.apiBaseUrl)) {
    return next(req);
  }

  // On the server, attempt the real API call so SSR generates real SEO content.
  // If the backend fails or returns an error, return a clean fallback so SSR does not crash.
  return next(req).pipe(
    catchError((err) => {
      console.warn(`[SSR API Fallback] Request to ${req.url} failed: ${err?.message || err}`);
      return of(new HttpResponse({ status: 200, body: getSsrFallbackBody(req.url) }));
    })
  );
};


function getSsrFallbackBody(url: string) {
  if (url.includes('/categories')) {
    return {
      success: true,
      statusCode: 200,
      data: { categories: [] },
    };
  }

  if (url.includes('/getPastEvents')) {
    return {
      success: true,
      statusCode: 200,
      data: { events: [], nextCursor: null },
    };
  }

  if (
    url.includes('/getAllEvents') ||
    url.includes('/getAllInterests') ||
    url.includes('/getEventForYou') ||
    url.includes('/getAllEventsByCategory') ||
    url.includes('/events/nearby') ||
    url.includes('/events/collection')
  ) {
    return {
      success: true,
      statusCode: 200,
      data: [],
    };
  }

  if (url.includes('/getEventDetails')) {
    return {
      success: false,
      statusCode: 404,
      data: null,
    };
  }

  if (url.includes('/getUserProfile') || url.includes('/getMyProfile')) {
    return {
      success: true,
      statusCode: 200,
      data: {},
    };
  }

  return {
    success: true,
    statusCode: 200,
    data: {},
  };
}

