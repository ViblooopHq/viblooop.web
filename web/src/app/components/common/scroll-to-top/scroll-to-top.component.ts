import { Component, HostListener, inject, signal } from '@angular/core';
import { BrowserService } from '../../../shared/services/browser/browser.service';

@Component({
  selector: 'vl-scroll-to-top',
  standalone: true,
  imports: [],
  templateUrl: './scroll-to-top.component.html',
  styleUrl: './scroll-to-top.component.scss'
})
export class ScrollToTopComponent {
  private browserService = inject(BrowserService);
  isVisible = signal(false);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.browserService.isBrowserPlatform()) {
      // Threshold of 400px to show the button
      const scrollOffset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      this.isVisible.set(scrollOffset > 400);
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
