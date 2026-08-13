import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SwiperConfigService {
  private isRegistered = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Safely registers Swiper web components only if running in the browser.
   * Prevents SSR ReferenceError: window is not defined.
   */
  async registerSwiperElements(): Promise<void> {
    if (this.isRegistered || !isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      // Dynamic import to strictly prevent Swiper from executing on the Node server
      const { register } = await import('swiper/element/bundle');
      register();
      this.isRegistered = true;
    } catch (error) {
      console.error('Failed to register Swiper Elements:', error);
    }
  }
}
