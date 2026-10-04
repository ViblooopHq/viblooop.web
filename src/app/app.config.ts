import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor, authInterceptorWithRefresh } from './interceptor/auth/auth.interceptor';
import { loaderInterceptor } from './interceptor/loader/loader.interceptor';
import { provideLottieOptions } from 'ngx-lottie';
import { playerFactory } from './player-factory';
import { apiCashingInterceptor } from './interceptor/apiCaching/api-cashing.interceptor';
import { ssrApiInterceptor } from './interceptor/ssrApi/ssr-api.interceptor';
import { provideServiceWorker } from '@angular/service-worker';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';
import { Environment } from '../environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp(Environment.firebase)),
    provideMessaging(() => getMessaging()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
    ),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([ssrApiInterceptor, authInterceptorWithRefresh, apiCashingInterceptor, loaderInterceptor])),
    provideLottieOptions({ player: playerFactory }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerImmediately',
      updateViaCache: 'imports',
    }),
  ],
};
