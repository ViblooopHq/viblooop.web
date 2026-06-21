import { Component, EventEmitter, Input, HostListener, Output } from '@angular/core';

export interface GalleryImage {
  url: string;
  path?: string;
  title?: string;
  archived?: boolean; // true = hidden in profile
}

@Component({
  selector: 'vl-gallery',
  imports: [],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent {
  @Input() images: GalleryImage[] = [];  // Images will come from events API
  @Input() showHeader = true;
  @Input() showGrid = true;
  @Input() showArchiveAction = true;
  @Input() showActions = false;
  @Input() canDownload = false;
  @Input() canDelete = false;
  @Input() deletingImagePath = '';

  @Output() deleteImage = new EventEmitter<GalleryImage>();

  selectedImage: GalleryImage | null = null;
  currentIndex: number = -1;
  isActionsOpen = false;
  isDeleteConfirmOpen = false;
  isDesktop: boolean = window.innerWidth >= 768; // tablet & laptop only

  // Update view on resize
  @HostListener('window:resize')
  onResize() {
    this.isDesktop = window.innerWidth >= 768;
  }

  onImageSelect(img: GalleryImage) {
    this.currentIndex = this.images.findIndex(i => i === img);
    this.selectedImage = img;
    this.closeActionPanels();
  }

  openAtIndex(index: number) {
    if (index < 0 || index >= this.images.length) return;

    this.currentIndex = index;
    this.selectedImage = this.images[index];
    this.closeActionPanels();
  }

  closePreview() {
    this.selectedImage = null;
    this.currentIndex = -1;
    this.closeActionPanels();
  }

  toggleArchive(img: GalleryImage) {
    img.archived = !img.archived;
    // Later you can call API here to update status
  }

  // Navigate Left
  showPrevImage() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.selectedImage = this.images[this.currentIndex];
      this.closeActionPanels();
    }
  }

  // Navigate Right
  showNextImage() {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
      this.selectedImage = this.images[this.currentIndex];
      this.closeActionPanels();
    }
  }

  get selectedImageKey(): string {
    return this.selectedImage?.path || this.selectedImage?.url || '';
  }

  get shouldShowActions(): boolean {
    return this.showActions && (this.canDownload || this.canDelete);
  }

  toggleActions() {
    if (!this.shouldShowActions) return;
    this.isActionsOpen = !this.isActionsOpen;
  }

  openDeleteConfirm() {
    if (!this.canDelete) return;
    this.isActionsOpen = false;
    this.isDeleteConfirmOpen = true;
  }

  closeDeleteConfirm() {
    this.isDeleteConfirmOpen = false;
  }

  requestDelete() {
    if (!this.canDelete || !this.selectedImage) return;
    this.deleteImage.emit(this.selectedImage);
  }

  private closeActionPanels() {
    this.isActionsOpen = false;
    this.isDeleteConfirmOpen = false;
  }
}
