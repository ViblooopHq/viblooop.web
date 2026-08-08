import { ChangeDetectionStrategy, Component, HostListener, input, output, signal } from '@angular/core';

export interface GalleryImage {
  url: string;
  path?: string;
  title?: string;
  archived?: boolean; // true = hidden in profile
}

@Component({
  selector: 'vl-gallery',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent {
  images = input<GalleryImage[]>([]);  // Images will come from events API
  showHeader = input(true);
  showGrid = input(true);
  showArchiveAction = input(true);
  showActions = input(false);
  canDownload = input(false);
  canDelete = input(false);
  deletingImagePath = input('');

  deleteImage = output<GalleryImage>();

  selectedImage = signal<GalleryImage | null>(null);
  currentIndex = signal(-1);
  isActionsOpen = signal(false);
  isDeleteConfirmOpen = signal(false);
  isDesktop = signal(window.innerWidth >= 768); // tablet & laptop only

  // Update view on resize
  @HostListener('window:resize')
  onResize() {
    this.isDesktop.set(window.innerWidth >= 768);
  }

  onImageSelect(img: GalleryImage) {
    this.currentIndex.set(this.images().findIndex(i => i === img));
    this.selectedImage.set(img);
    this.closeActionPanels();
  }

  openAtIndex(index: number) {
    if (index < 0 || index >= this.images().length) return;

    this.currentIndex.set(index);
    this.selectedImage.set(this.images()[index]);
    this.closeActionPanels();
  }

  closePreview() {
    this.selectedImage.set(null);
    this.currentIndex.set(-1);
    this.closeActionPanels();
  }

  toggleArchive(img: GalleryImage) {
    img.archived = !img.archived;
    // Later you can call API here to update status
  }

  // Navigate Left
  showPrevImage() {
    const index = this.currentIndex();
    if (index > 0) {
      this.currentIndex.set(index - 1);
      this.selectedImage.set(this.images()[index - 1]);
      this.closeActionPanels();
    }
  }

  // Navigate Right
  showNextImage() {
    const index = this.currentIndex();
    if (index < this.images().length - 1) {
      this.currentIndex.set(index + 1);
      this.selectedImage.set(this.images()[index + 1]);
      this.closeActionPanels();
    }
  }

  get selectedImageKey(): string {
    const image = this.selectedImage();
    return image?.path || image?.url || '';
  }

  get shouldShowActions(): boolean {
    return this.showActions() && (this.canDownload() || this.canDelete());
  }

  toggleActions() {
    if (!this.shouldShowActions) return;
    this.isActionsOpen.update((isOpen) => !isOpen);
  }

  openDeleteConfirm() {
    if (!this.canDelete()) return;
    this.isActionsOpen.set(false);
    this.isDeleteConfirmOpen.set(true);
  }

  closeDeleteConfirm() {
    this.isDeleteConfirmOpen.set(false);
  }

  requestDelete() {
    const image = this.selectedImage();
    if (!this.canDelete() || !image) return;
    this.deleteImage.emit(image);
  }

  private closeActionPanels() {
    this.isActionsOpen.set(false);
    this.isDeleteConfirmOpen.set(false);
  }
}
