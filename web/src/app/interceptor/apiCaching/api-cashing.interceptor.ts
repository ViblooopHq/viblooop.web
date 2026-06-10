import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';

export const apiCashingInterceptor: HttpInterceptorFn = (req, next) => {

  if(req.url.includes('/getUserProfile1')) {
    const cached = sessionStorage.getItem(req.url);
    if (cached) {
      return of(new HttpResponse({ status: 200, body: JSON.parse(cached) }));
    }
    return next(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          sessionStorage.setItem(req.url, JSON.stringify(event.body));
        }
      })
    );
  }
  return next(req);
};
