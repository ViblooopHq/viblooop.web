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
    this.appDrawerService.close();
    this.router.navigate([path, params]);
    if (this.browserService.isBrowserPlatform()) {
      window.scrollTo(0, 0);
    }
  }

  navigateByUrl(path: string) {
    this.appDrawerService.close();
    this.router.navigateByUrl(path);
    if (this.browserService.isBrowserPlatform()) {
      window.scrollTo(0, 0);
    }
  }

  navigateToDrawer(drawerPath: string, mobileFallbackPath: string, queryParams?: Record<string, string>) {
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

    if (drawerPath === 'edit-profile') {
      this.appDrawerService.openEditProfile();
      return;
    }

    if (drawerPath === 'my-wishlist') {
      this.appDrawerService.openWishlist();
      return;
    }

    if (drawerPath === 'notifications') {
      this.appDrawerService.openNotifications();
      return;
    }

    if (drawerPath === 'chats') {
      this.appDrawerService.openChats(queryParams?.['eventId']);
      return;
    }

    this.navigateByUrl(mobileFallbackPath);
  }

  closeDrawer() {
    this.appDrawerService.close();
  }

  closeDrawerOrNavigate(fallbackPath: string) {
    if (this.appDrawerService.hasOpenDrawer) {
      this.appDrawerService.close();
      return;
    }

    this.navigateByUrl(fallbackPath);
  }

  closeDrawerAndNavigateByUrl(path: string) {
    this.appDrawerService.close();
    this.navigateByUrl(path);
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
