import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoaderService } from '../../shared/services/loader/loader.service';
import { finalize } from 'rxjs';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);
  if(req.url.includes('createEvent')|| req.url.includes('updateProfile') || req.url.includes('updateEvent') || req.url.includes('deleteEvent')) {
  loaderService.show();
  }
  return next(req).pipe(
    finalize(() => {
      loaderService.hide()
    })
  );
};
