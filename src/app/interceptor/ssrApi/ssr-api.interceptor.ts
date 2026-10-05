import { isPlatformServer } from '@angular/common';
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Environment } from '../../../environment';

export const ssrApiInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformServer(platformId) || !req.url.startsWith(Environment.apiBaseUrl)) {
    return next(req);
  }

  // On the server, attempt the real API call so SSR generates real SEO content.
  // If the backend fails, is unreachable, or times out (4s), return a clean fallback
  // so the SSR page render does not crash or hang.
  return next(req).pipe(
    timeout(4000),
    catchError((err) => {
      console.warn(`[SSR API Fallback] Request to ${req.url} failed: ${err?.message || err}`);
      return of(new HttpResponse({ status: 200, body: getSsrFallbackBody(req.url) }));
    })
  );
};


function getSsrFallbackBody(url: string) {
  if (url.endsWith('/categories')) {
    return {
      success: true,
      statusCode: 200,
      data: { categories: [] },
    };
  }

  if (url.endsWith('/getPastEvents')) {
    return {
      success: true,
      statusCode: 200,
      data: { events: [], nextCursor: null },
    };
  }

  if (url.endsWith('/getAllEvents') || url.endsWith('/getAllInterests')) {
    return {
      success: true,
      statusCode: 200,
      data: [],
    };
  }

  if (url.endsWith('/getUserProfile')) {
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
