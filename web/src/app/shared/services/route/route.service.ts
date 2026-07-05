import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BrowserService } from '../browser/browser.service';
import { AppDrawerService } from '../drawer/app-drawer.service';
import { CompleteProfileService } from '../popup/complete-profile.service';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  route: ActivatedRoute = inject(ActivatedRoute)
  router: Router = inject(Router)
  browserService = inject(BrowserService);
  private readonly appDrawerService = inject(AppDrawerService);
  private readonly completeProfileService = inject(CompleteProfileService);

  constructor() { }

  /**
   *
   * @param path
   * @param params
   */
  navigate(path: string, params: any) {
    this.router.navigate([path, params])
    if (this.browserService.isBrowserPlatform()) {
      window.scrollTo(0, 0);
    }
  }

  navigateByUrl(path: string) {
    this.router.navigateByUrl(path)
    if (this.browserService.isBrowserPlatform()) {
      window.scrollTo(0, 0);
    }
  }

  navigateToDrawer(drawerPath: string, mobileFallbackPath: string, queryParams?: Record<string, string>) {
    if (!this.isDesktopDrawerAvailable()) {
      this.navigateByUrl(mobileFallbackPath);
      return;
    }

    if (drawerPath === 'create-event') {
      this.completeProfileService.checkProfileAndShowPopup().subscribe((isComplete) => {
        if (!isComplete) return;

        if (queryParams?.['mode'] === 'edit' && queryParams?.['eventId']) {
          this.appDrawerService.openEditEvent(queryParams['eventId']);
        } else {
          this.appDrawerService.openCreateEvent();
        }
      });
      return;
    }

    this.router.navigate([{ outlets: { drawer: [drawerPath] } }], { queryParams });
  }

  closeDrawer() {
    if (this.appDrawerService.hasOpenDrawer) {
      this.appDrawerService.close();
      return;
    }

    this.router.navigate([{ outlets: { drawer: null } }], { replaceUrl: true });
  }

  closeDrawerOrNavigate(fallbackPath: string) {
    if (this.appDrawerService.hasOpenDrawer || this.router.url.includes('(drawer:')) {
      this.closeDrawer();
      return;
    }

    this.navigateByUrl(fallbackPath);
  }

  navigateBack() {
    if (this.browserService.isBrowserPlatform()) {
      window.history.back();
    }
  }

  navigateByState(path: string, state: any) {
    this.router.navigateByUrl(path, { state: state });
    if (this.browserService.isBrowserPlatform()) {
      window.scrollTo(0, 0);
    }
  }

  private isDesktopDrawerAvailable(): boolean {
    return this.browserService.isBrowserPlatform() && window.matchMedia('(min-width: 768px)').matches;
  }

}
