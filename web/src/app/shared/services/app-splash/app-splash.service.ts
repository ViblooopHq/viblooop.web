import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface AppSplashOptions {
  message?: string;
  subtitle?: string;
  showBrandWatermark?: boolean;
  showProgressDots?: boolean;
  minDurationMs?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AppSplashService {
  private readonly platformId = inject(PLATFORM_ID);

  /** Whether the splash screen is mounted in the DOM */
  readonly isVisible = signal<boolean>(false);

  /** Whether the splash screen is currently playing its exit fade-out animation */
  readonly isFadingOut = signal<boolean>(false);

  /** Dynamic message displayed below the logo mark */
  readonly message = signal<string>('Syncing your vibes...');

  /** Subtitle / brand tag displayed at bottom */
  readonly subtitle = signal<string>('Finding the best events near you');

  /** Whether to show the bottom brand watermark */
  readonly showBrandWatermark = signal<boolean>(true);

  /** Whether to show the animated progress dots */
  readonly showProgressDots = signal<boolean>(true);

  private splashStartTime: number = Date.now();
  private hideTimeout?: ReturnType<typeof setTimeout>;
  private removeTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Remove static pre-boot fallback element from index.html once Angular takes over
      const initialSplash = document.getElementById('vl-initial-splash');
      if (initialSplash) {
        initialSplash.remove();
      }
    }
  }

  /**
   * Action-specific: App Launch / Refresh boot
   */
  showBootSplash(): void {
    this.show({
      message: 'Syncing your vibes...',
      subtitle: 'Finding the best events near you',
      showBrandWatermark: true,
      showProgressDots: true,
    });
  }

  /**
   * Action-specific: Login / OTP verification
   */
  showLoginSplash(isNewUser: boolean = false): void {
    this.show({
      message: isNewUser ? 'Creating your vibe profile...' : 'Signing you in...',
      subtitle: 'Preparing your personalized experience',
      showBrandWatermark: true,
      showProgressDots: true,
    });
  }

  /**
   * Action-specific: Logout session teardown
   */
  showLogoutSplash(): void {
    this.show({
      message: 'Logging out safely...',
      subtitle: 'See you soon on Viblooop!',
      showBrandWatermark: true,
      showProgressDots: true,
    });
  }

  /**
   * Display the full-screen splash loader with custom options
   */
  show(options?: AppSplashOptions): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.clearTimeouts();
    this.splashStartTime = Date.now();

    if (options?.message) this.message.set(options.message);
    if (options?.subtitle) this.subtitle.set(options.subtitle);
    if (options?.showBrandWatermark !== undefined) this.showBrandWatermark.set(options.showBrandWatermark);
    if (options?.showProgressDots !== undefined) this.showProgressDots.set(options.showProgressDots);

    this.isFadingOut.set(false);
    this.isVisible.set(true);
  }

  /**
   * Gracefully hide the splash loader after ensuring minimum display duration (default 3 seconds)
   */
  hide(minDurationMs: number = 3000): void {
    if (!isPlatformBrowser(this.platformId) || !this.isVisible()) return;

    this.clearTimeouts();

    const elapsed = Date.now() - this.splashStartTime;
    const remainingDelay = Math.max(0, minDurationMs - elapsed);

    this.hideTimeout = setTimeout(() => {
      // Trigger smooth CSS fade-out animation
      this.isFadingOut.set(true);

      // Remove from DOM after fade-out completes (320ms)
      this.removeTimeout = setTimeout(() => {
        this.isVisible.set(false);
        this.isFadingOut.set(false);
      }, 320);
    }, remainingDelay);
  }

  private clearTimeouts(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }
    if (this.removeTimeout) {
      clearTimeout(this.removeTimeout);
      this.removeTimeout = undefined;
    }
  }
}
