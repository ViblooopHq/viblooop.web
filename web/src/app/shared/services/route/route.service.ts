import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BrowserService } from '../browser/browser.service';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  route: ActivatedRoute = inject(ActivatedRoute)
  router: Router = inject(Router)
  browserService = inject(BrowserService);

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

  navigateToDrawer(drawerPath: string, mobileFallbackPath: string) {
    if (!this.isDesktopDrawerAvailable()) {
      this.navigateByUrl(mobileFallbackPath);
      return;
    }

    this.router.navigate([{ outlets: { drawer: [drawerPath] } }]);
  }

  closeDrawer() {
    this.router.navigate([{ outlets: { drawer: null } }]);
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
