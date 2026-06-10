import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { RouteService } from '../../services/route/route.service';

@Component({
  selector: 'vl-form-drawer',
  standalone: true,
  templateUrl: './form-drawer.component.html',
  styleUrl: './form-drawer.component.scss',
})
export class FormDrawerComponent implements OnInit, OnDestroy {
  private routeService = inject(RouteService);

  @Input() ariaLabel = 'Form drawer';
  isClosing = false;
  private bodyPreviousOverflow = '';
  private pagePreviousOverflow = '';
  private pageContainer: HTMLElement | null = null;

  ngOnInit(): void {
    if (!this.isDesktopDrawer()) return;

    this.bodyPreviousOverflow = document.body.style.overflow;
    this.pageContainer = document.querySelector('.vl-body-container');
    this.pagePreviousOverflow = this.pageContainer?.style.overflow || '';

    document.body.style.overflow = 'hidden';
    if (this.pageContainer) {
      this.pageContainer.style.overflow = 'hidden';
    }
  }

  ngOnDestroy(): void {
    if (typeof document === 'undefined') return;

    document.body.style.overflow = this.bodyPreviousOverflow;
    if (this.pageContainer) {
      this.pageContainer.style.overflow = this.pagePreviousOverflow;
    }
  }

  closeDrawer(): void {
    if (this.isClosing) return;

    this.isClosing = true;
    setTimeout(() => this.routeService.closeDrawer(), 320);
  }

  private isDesktopDrawer(): boolean {
    return typeof window !== 'undefined'
      && typeof document !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(min-width: 768px)').matches;
  }
}
