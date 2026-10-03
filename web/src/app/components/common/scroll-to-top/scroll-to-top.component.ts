import { Component, HostListener, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { BrowserService } from '../../../shared/services/browser/browser.service';

@Component({
  selector: 'vl-scroll-to-top',
  standalone: true,
  imports: [],
  templateUrl: './scroll-to-top.component.html',
  styleUrl: './scroll-to-top.component.scss'
})
export class ScrollToTopComponent implements OnInit, OnDestroy {
  private browserService = inject(BrowserService);
  private router = inject(Router);
  private routerSub?: Subscription;

  isVisible = signal(false);
  isEventDetailsRoute = signal(false);
  footerClearance = signal(0);

  ngOnInit() {
    this.checkRoute();
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkRoute();
    });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  private checkRoute() {
    const path = this.router.url.split(/[?#]/, 1)[0].replace(/\/$/, '');
    const isEventDetails = /^\/events\/[^/]+$/.test(path) && !path.startsWith('/events/view-all/');
    this.isEventDetailsRoute.set(isEventDetails);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.browserService.isBrowserPlatform()) {
      // Show button as soon as user starts scrolling down (180px threshold)
      const scrollOffset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      this.isVisible.set(scrollOffset > 180);
      const footer = document.querySelector('vl-footer')?.getBoundingClientRect();
      this.footerClearance.set(footer && footer.top < window.innerHeight
        ? Math.min(window.innerHeight - footer.top + 16, window.innerHeight - 64)
        : 0);
    }
  }

  scrollToTop() {
    if (this.browserService.isBrowserPlatform()) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }
}
