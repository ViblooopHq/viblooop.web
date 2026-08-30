import { ChangeDetectionStrategy, Component, ElementRef, input, output, ViewChild } from '@angular/core';
import { GalleryComponent, GalleryImage } from '../../../../../shared/components/gallery/gallery.component';
import { InlineLoaderComponent } from '../../../../../shared/components/inline-loader/inline-loader.component';

@Component({
  selector: 'vl-event-gallery-section',
  imports: [GalleryComponent, InlineLoaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-gallery-section.component.html',
  styleUrl: './event-gallery-section.component.scss',
})
export class EventGallerySectionComponent {
  @ViewChild('photoUploadInput') private photoUploadInput!: ElementRef<HTMLInputElement>;
  @ViewChild(GalleryComponent) private galleryPreview?: GalleryComponent;

  images = input<GalleryImage[]>([]);
  isEventCreator = input(false);
  canDownload = input(false);
  deletingImagePath = input('');
  isUploading = input(false);

  uploadPhotos = output<File[]>();
  deleteImage = output<string>();

  openPreview(index: number) {
    this.galleryPreview?.openAtIndex(index);
  }

  /** Called by the container once a delete request it owns has succeeded. */
  closeGalleryPreview() {
    this.galleryPreview?.closePreview();
  }

  triggerUpload() {
    if (!this.isEventCreator()) return;
    this.photoUploadInput.nativeElement.click();
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length) this.uploadPhotos.emit(files);
    input.value = '';
  }

  onDeleteImage(image: GalleryImage) {
    if (image.path) this.deleteImage.emit(image.path);
  }
}
