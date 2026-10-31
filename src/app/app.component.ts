import {
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { ThemeService } from './shared/services/theme/theme.service';
import { BrowserService } from './shared/services/browser/browser.service';
import { FooterComponent } from './components/common/footer/footer.component';
import { HeaderComponent } from './components/common/header/header.component';
import { RouteService } from './shared/services/route/route.service';
import { AuthService } from './shared/services/auth/auth.service';
import { GlobalLoaderComponent } from './shared/components/loader/global-loader/global-loader.component';
import { SocketService } from './shared/services/socket/socket.service';
import { CompleteProfileService } from './shared/services/popup/complete-profile.service';
import { CompleteProfileComponent } from './shared/components/pop-ups/complete-profile/complete-profile.component';

import { ScrollToTopComponent } from './components/common/scroll-to-top/scroll-to-top.component';
import { AppDrawerService } from './shared/services/drawer/app-drawer.service';
import { CreateEventComponent } from './components/events/create-event/create-event.component';
import { EditProfileComponent } from './components/user-profile/edit-profile/edit-profile.component';
import { WishlistComponent } from './components/user-profile/wishlist/wishlist.component';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { InboxComponent } from './components/chat/inbox/inbox.component';
import { MessageService } from './shared/services/message/message.service';
import { AppSplashLoaderComponent } from './shared/components/app-splash-loader/app-splash-loader.component';
import { AppSplashService } from './shared/services/app-splash/app-splash.service';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { FormDrawerComponent } from './shared/components/form-drawer/form-drawer.component';
import { MyPlansComponent } from './components/events/my-plans/my-plans.component';
import { Environment } from '../environment';

import { inject as injectAnalytics } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { SeoService } from './shared/services/seo/seo.service';
import { ActivatedRoute } from '@angular/router';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

@Component({
  selector: 'vl-app-root',
  imports: [
    RouterOutlet,
    MatSlideToggleModule,
    HeaderComponent,
    FooterComponent,
    GlobalLoaderComponent,
    CompleteProfileComponent,
    CommonModule,
    ScrollToTopComponent,
    CreateEventComponent,
    EditProfileComponent,
    WishlistComponent,
    NotificationComponent,
    InboxComponent,
    AppSplashLoaderComponent,
    ToastContainerComponent,
    FormDrawerComponent,
    MyPlansComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'Viblooop';
  hideHeader = false;
  hideFooter = false;
  themeService = inject(ThemeService);
  browserService = inject(BrowserService);
  router = inject(RouteService);
  angularRouter = inject(Router);
  authService = inject(AuthService);
  socketService = inject(SocketService);
  completeProfileService = inject(CompleteProfileService);
  appDrawerService = inject(AppDrawerService);
  messageService = inject(MessageService);
  appSplashService = inject(AppSplashService);
  seoService = inject(SeoService);
  activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.updateFooterVisibility(this.angularRouter.url);
    this.updateSeoOnNavigation(this.angularRouter.url);
    this.angularRouter.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.updateFooterVisibility(event.urlAfterRedirects);
        this.scrollToTopOnNavigation(event.urlAfterRedirects);
        this.updateSeoOnNavigation(event.urlAfterRedirects);
        this.trackPageView(event.urlAfterRedirects);
      });

    this.trackPageView(this.angularRouter.url);

    this.authService.initAuth();

    this.authService.userDetails$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(userData => {
        if (userData) {
          this.socketService.connect();
        } else {
          this.socketService.disconnect();
        }
      });

    this.themeService.loadTheme();

    if (this.browserService.isBrowserPlatform()) {
      injectAnalytics();
      injectSpeedInsights();
    }
  }

  private updateSeoOnNavigation(url: string) {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const data = route.snapshot.data;
    const cleanPath = url.split('?')[0].split('#')[0].replace(/\/$/, '');
    const canonicalUrl = `${Environment.ogPageUrl}${cleanPath || '/'}`;

    if (data && (data['description'] || data['robots'])) {
      this.seoService.updateSeo({
        description: data['description'],
        canonicalUrl,
        robots: data['robots'],
        ogUrl: canonicalUrl,
      });
    } else {
      this.seoService.updateCanonicalUrl(canonicalUrl);
    }
  }

  private trackPageView(url: string) {
    if (!this.browserService.isBrowserPlatform()) return;

    window.gtag?.('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: url,
    });
  }

  private updateFooterVisibility(url: string) {
    const routePath = url.split('?')[0].split('#')[0].replace(/\/$/, '');
    this.hideHeader = routePath === '/login' || routePath.startsWith('/login/') || routePath === '/admin';
    this.hideFooter = !['', '/explore', '/profile', '/safety-guidelines', '/privacy', '/terms'].includes(routePath);
  }

  private scrollToTopOnNavigation(url: string) {
    if (!this.browserService.isBrowserPlatform() || url.includes('#') || url.includes('(drawer:')) return;

    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.querySelector('.vl-body-container')?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }

}
