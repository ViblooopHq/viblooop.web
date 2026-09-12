import { isPlatformServer } from '@angular/common';
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { of } from 'rxjs';
import { Environment } from '../../../environment';

export const ssrApiInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformServer(platformId) || !req.url.startsWith(Environment.apiBaseUrl)) {
    return next(req);
  }

  return of(new HttpResponse({ status: 200, body: getSsrFallbackBody(req.url) }));
};

function getSsrFallbackBody(url: string) {
  if (url.endsWith('/categories')) {
    return {
      success: true,
      statusCode: 200,
      data: { categories: [] },
    };
  }

  if (
    url.endsWith('/getAllEvents')
    || url.endsWith('/getPastEvents')
    || url.endsWith('/getAllInterests')
  ) {
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
