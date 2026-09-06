import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AppDrawerService } from '../../services/drawer/app-drawer.service';

@Component({
  selector: 'vl-form-drawer',
  standalone: true,
  templateUrl: './form-drawer.component.html',
  styleUrl: './form-drawer.component.scss',
})
export class FormDrawerComponent implements OnInit, OnDestroy {
  private appDrawerService = inject(AppDrawerService);
  private platformId = inject(PLATFORM_ID);

  @Input() ariaLabel = 'Form drawer';
  @Output() closed = new EventEmitter<void>();

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
      this.closed.emit();
      this.appDrawerService.close();
    }, 280);
  }
}

