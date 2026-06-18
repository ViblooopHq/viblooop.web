import { Component, Input, HostListener } from '@angular/core';

export interface GalleryImage {
  url: string;
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

  selectedImage: GalleryImage | null = null;
  currentIndex: number = -1;
  isDesktop: boolean = window.innerWidth >= 768; // tablet & laptop only

  // Update view on resize
  @HostListener('window:resize')
  onResize() {
    this.isDesktop = window.innerWidth >= 768;
  }

  onImageSelect(img: GalleryImage) {
    this.currentIndex = this.images.findIndex(i => i === img);
    this.selectedImage = img;
  }

  openAtIndex(index: number) {
    if (index < 0 || index >= this.images.length) return;

    this.currentIndex = index;
    this.selectedImage = this.images[index];
  }

  closePreview() {
    this.selectedImage = null;
    this.currentIndex = -1;
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
    }
  }

  // Navigate Right
  showNextImage() {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
      this.selectedImage = this.images[this.currentIndex];
    }
  }
}
