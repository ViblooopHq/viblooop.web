import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ScrollLockService {
  private readonly platformId = inject(PLATFORM_ID);
  private lockCount = 0;

  /**
   * Locks background page scrolling when a drawer or modal opens.
   * Reference-counted so nested or concurrent overlays don't prematurely release scroll lock.
   */
  lock(): void {
    if (!isPlatformBrowser(this.platformId) || typeof document === 'undefined') return;

    this.lockCount++;
    if (this.lockCount === 1) {
      if (document.body) {
        document.body.style.overflow = 'hidden';
      }
      if (document.documentElement) {
        document.documentElement.style.overflow = 'hidden';
      }
      const pageContainer = document.querySelector<HTMLElement>('.vl-body-container');
      if (pageContainer) {
        pageContainer.style.overflow = 'hidden';
      }
    }
  }

  /**
   * Releases scroll lock when a drawer or modal closes.
   * Restores overflow to 'auto' once all active overlay locks are cleared.
   */
  unlock(): void {
    if (!isPlatformBrowser(this.platformId) || typeof document === 'undefined') return;

    this.lockCount = Math.max(0, this.lockCount - 1);
    if (this.lockCount === 0) {
      if (document.body) {
        document.body.style.overflow = 'auto';
      }
      if (document.documentElement) {
        document.documentElement.style.overflow = 'auto';
      }
      const pageContainer = document.querySelector<HTMLElement>('.vl-body-container');
      if (pageContainer) {
        pageContainer.style.overflow = 'auto';
      }
    }
  }

  /**
   * Forcibly clears all locks and restores overflow to 'auto'.
   */
  reset(): void {
    if (!isPlatformBrowser(this.platformId) || typeof document === 'undefined') return;

    this.lockCount = 0;
    if (document.body) {
      document.body.style.overflow = 'auto';
    }
    if (document.documentElement) {
      document.documentElement.style.overflow = 'auto';
    }
    const pageContainer = document.querySelector<HTMLElement>('.vl-body-container');
    if (pageContainer) {
      pageContainer.style.overflow = 'auto';
    }
  }
}

