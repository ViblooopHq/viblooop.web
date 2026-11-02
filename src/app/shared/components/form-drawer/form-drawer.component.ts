import { Component, EventEmitter, HostBinding, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AppDrawerService } from '../../services/drawer/app-drawer.service';
import { ScrollLockService } from '../../services/scroll-lock/scroll-lock.service';

@Component({
  selector: 'vl-form-drawer',
  standalone: true,
  templateUrl: './form-drawer.component.html',
  styleUrl: './form-drawer.component.scss',
})
export class FormDrawerComponent implements OnInit, OnDestroy {
  private readonly appDrawerService = inject(AppDrawerService);
  private readonly scrollLockService = inject(ScrollLockService);

  @Input() ariaLabel = 'Form drawer';
  @Output() closed = new EventEmitter<void>();

  @HostBinding('class.vl-form-drawer-host--closing') isClosing = false;
  private isLocked = false;

  private touchStartY = 0;
  private touchStartX = 0;
  private touchStartTime = 0;

  private pointerStartY = 0;
  private pointerStartX = 0;
  private pointerStartTime = 0;
  private isPointerDown = false;

  ngOnInit(): void {
    this.scrollLockService.lock();
    this.isLocked = true;
  }

  ngOnDestroy(): void {
    this.unlockScroll();
  }

  private unlockScroll(): void {
    if (!this.isLocked) return;
    this.isLocked = false;
    this.scrollLockService.unlock();
  }

  onTouchStart(event: TouchEvent): void {
    if (event.touches.length > 0) {
      this.touchStartY = event.touches[0].clientY;
      this.touchStartX = event.touches[0].clientX;
      this.touchStartTime = Date.now();
    }
  }

  onTouchEnd(event: TouchEvent): void {
    if (this.isClosing || event.changedTouches.length === 0) return;

    const deltaY = event.changedTouches[0].clientY - this.touchStartY;
    const deltaX = Math.abs(event.changedTouches[0].clientX - this.touchStartX);
    const elapsedTime = Date.now() - this.touchStartTime;

    const isDownward = deltaY > deltaX;
    const isFastSwipe = elapsedTime < 350 && deltaY > 30;
    const isLongSwipe = deltaY > 50;

    if (isDownward && (isFastSwipe || isLongSwipe)) {
      this.closeDrawer();
    }
  }

  onTouchCancel(): void {
    this.touchStartY = 0;
    this.touchStartX = 0;
    this.touchStartTime = 0;
  }

  onPointerDown(event: PointerEvent): void {
    if (event.pointerType === 'touch') return;
    if (event.button !== 0) return;

    this.pointerStartY = event.clientY;
    this.pointerStartX = event.clientX;
    this.pointerStartTime = Date.now();
    this.isPointerDown = true;
    try {
      (event.currentTarget as HTMLElement)?.setPointerCapture?.(event.pointerId);
    } catch {
      // Ignore pointer capture errors if unsupported
    }
  }

  onPointerUp(event: PointerEvent): void {
    if (event.pointerType === 'touch') return;
    if (!this.isPointerDown || this.isClosing) return;
    this.isPointerDown = false;

    const deltaY = event.clientY - this.pointerStartY;
    const deltaX = Math.abs(event.clientX - this.pointerStartX);
    const elapsedTime = Date.now() - this.pointerStartTime;

    const isDownward = deltaY > deltaX;
    const isFastSwipe = elapsedTime < 350 && deltaY > 30;
    const isLongSwipe = deltaY > 50;

    if (isDownward && (isFastSwipe || isLongSwipe)) {
      this.closeDrawer();
    }
  }

  onPointerCancel(): void {
    this.isPointerDown = false;
  }

  closeDrawer(): void {
    if (this.isClosing) return;

    this.isClosing = true;
    setTimeout(() => {
      this.closed.emit();
      this.appDrawerService.close();
      this.unlockScroll();
    }, 280);
  }
}
