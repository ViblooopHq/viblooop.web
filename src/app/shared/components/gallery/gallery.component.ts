import { ChangeDetectionStrategy, Component, computed, HostListener, inject, input, OnDestroy, output, signal } from '@angular/core';
import { InlineLoaderComponent } from '../inline-loader/inline-loader.component';
import { ScrollLockService } from '../../services/scroll-lock/scroll-lock.service';

export interface GalleryImage {
  url: string;
  path?: string;
  title?: string;
  archived?: boolean; // true = hidden in profile
  uploaderId?: string;
}

@Component({
  selector: 'vl-gallery',
  imports: [InlineLoaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements OnDestroy {
  private readonly scrollLockService = inject(ScrollLockService);

  images = input<GalleryImage[]>([]);
  showHeader = input(true);
  showGrid = input(true);
  showArchiveAction = input(true);
  showActions = input(false);
  canDownload = input(false);
  canDelete = input(false);
  isEventCreator = input(false);
  currentUserId = input('');
  deletingImagePath = input('');

  deleteImage = output<GalleryImage>();

  selectedImage = signal<GalleryImage | null>(null);
  currentIndex = signal(-1);
  isGridView = signal(false);
  isActionsOpen = signal(false);
  isDeleteConfirmOpen = signal(false);
  isDesktop = signal(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  private hasScrollLock = false;

  canDeleteSelectedImage = computed(() => {
    if (this.isEventCreator() || this.canDelete()) return true;
    const img = this.selectedImage();
    const userId = this.currentUserId();
    if (!img || !userId) return false;
    return !!(img.uploaderId && String(img.uploaderId) === String(userId));
  });

  get isOpen(): boolean {
    return this.selectedImage() !== null || this.isGridView();
  }

  get selectedImageKey(): string {
    const image = this.selectedImage();
    return image?.path || image?.url || '';
  }

  get shouldShowActions(): boolean {
    return this.showActions() && (this.canDownload() || this.canDeleteSelectedImage());
  }

  @HostListener('window:resize')
  onResize() {
    if (typeof window !== 'undefined') {
      this.isDesktop.set(window.innerWidth >= 768);
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.isOpen) return;

    if (event.key === 'Escape') {
      if (this.isDeleteConfirmOpen()) {
        this.closeDeleteConfirm();
      } else {
        this.closePreview();
      }
    } else if (event.key === 'ArrowLeft') {
      if (!this.isGridView()) this.showPrevImage();
    } else if (event.key === 'ArrowRight') {
      if (!this.isGridView()) this.showNextImage();
    }
  }

  ngOnDestroy(): void {
    this.unlockScroll();
  }

  onImageSelect(img: GalleryImage) {
    const index = this.images().findIndex(i => i === img);
    this.openAtIndex(index >= 0 ? index : 0);
  }

  openAtIndex(index: number) {
    if (index < 0 || index >= this.images().length) return;

    this.currentIndex.set(index);
    this.selectedImage.set(this.images()[index]);
    this.isGridView.set(false);
    this.closeActionPanels();
    this.lockScroll();
  }

  openGridView() {
    if (this.images().length === 0) return;
    this.isGridView.set(true);
    if (this.currentIndex() < 0) {
      this.currentIndex.set(0);
      this.selectedImage.set(this.images()[0]);
    }
    this.closeActionPanels();
    this.lockScroll();
  }

  toggleGridView() {
    this.isGridView.update((grid) => !grid);
  }

  closePreview() {
    this.selectedImage.set(null);
    this.currentIndex.set(-1);
    this.isGridView.set(false);
    this.closeActionPanels();
    this.unlockScroll();
  }

  toggleArchive(img: GalleryImage) {
    img.archived = !img.archived;
  }

  showPrevImage() {
    const index = this.currentIndex();
    if (index > 0) {
      this.openAtIndex(index - 1);
    }
  }

  showNextImage() {
    const index = this.currentIndex();
    if (index < this.images().length - 1) {
      this.openAtIndex(index + 1);
    }
  }

  selectFromFilmstrip(index: number) {
    this.openAtIndex(index);
  }

  toggleActions() {
    if (!this.shouldShowActions) return;
    this.isActionsOpen.update((isOpen) => !isOpen);
  }

  openDeleteConfirm() {
    if (!this.canDeleteSelectedImage()) return;
    this.isActionsOpen.set(false);
    this.isDeleteConfirmOpen.set(true);
  }

  closeDeleteConfirm() {
    this.isDeleteConfirmOpen.set(false);
  }

  requestDelete() {
    const image = this.selectedImage();
    if (!this.canDeleteSelectedImage() || !image) return;
    this.deleteImage.emit(image);
  }

  private lockScroll(): void {
    if (!this.hasScrollLock) {
      this.scrollLockService.lock();
      this.hasScrollLock = true;
    }
  }

  private unlockScroll(): void {
    if (this.hasScrollLock) {
      this.scrollLockService.unlock();
      this.hasScrollLock = false;
    }
  }

  private closeActionPanels() {
    this.isActionsOpen.set(false);
    this.isDeleteConfirmOpen.set(false);
  }
}
