import { Component, inject, Input, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouteService } from '../../services/route/route.service';

@Component({
  selector: 'vl-form-drawer',
  standalone: true,
  templateUrl: './form-drawer.component.html',
  styleUrl: './form-drawer.component.scss',
})
export class FormDrawerComponent implements OnInit, OnDestroy {
  private routeService = inject(RouteService);
  private platformId = inject(PLATFORM_ID);

  @Input() ariaLabel = 'Form drawer';
  isClosing = false;
  private bodyPreviousOverflow = '';
  private pagePreviousOverflow = '';
  private pageContainer: HTMLElement | null = null;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId) || typeof document === 'undefined') return;

    try {
      this.bodyPreviousOverflow = document.body?.style?.overflow || '';
      this.pageContainer = document.querySelector('.vl-body-container');
      this.pagePreviousOverflow = this.pageContainer?.style?.overflow || '';

      if (document.body) {
        document.body.style.overflow = 'hidden';
      }
      if (this.pageContainer) {
        this.pageContainer.style.overflow = 'hidden';
      }
    } catch {
      // Ignore DOM access issues in non-standard environments
    }
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId) || typeof document === 'undefined') return;

    try {
      if (document.body) {
        document.body.style.overflow = this.bodyPreviousOverflow;
      }
      if (this.pageContainer) {
        this.pageContainer.style.overflow = this.pagePreviousOverflow;
      }
    } catch {
      // Ignore cleanup error
    }
  }

  closeDrawer(): void {
    if (this.isClosing) return;

    this.isClosing = true;
    setTimeout(() => {
      this.routeService.closeDrawerOrNavigate('/profile');
    }, 280);
  }
}
