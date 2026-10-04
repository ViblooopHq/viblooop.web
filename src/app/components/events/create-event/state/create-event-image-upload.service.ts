import { Injectable, computed, inject, signal } from '@angular/core';
import { SharedService } from '../../../../shared/services/shared.service';

@Injectable()
export class CreateEventImageUploadService {
  private readonly sharedService = inject(SharedService);

  readonly mainImageFile = signal<File | null>(null);
  readonly mainImagePreview = signal<string | ArrayBuffer | null>(null);
  readonly galleryFiles = signal<File[]>([]);
  readonly galleryPreviews = signal<string[]>([]);
  readonly isImageLoading = signal(false);

  private readonly shouldReplaceCoverWithDefault = signal(false);

  readonly canRemoveMainImage = computed(() => !!this.mainImagePreview());

  async onMainImageChange(file: File | undefined | null): Promise<void> {
    if (!file) return;

    this.isImageLoading.set(true);
    try {
      const finalFile = await this.sharedService.convertHeicToJpg(file);

      this.mainImageFile.set(finalFile);
      this.shouldReplaceCoverWithDefault.set(false);

      const reader = new FileReader();
      reader.onload = () => this.mainImagePreview.set(reader.result);
      reader.readAsDataURL(finalFile);
    } catch (err) {
      console.error('Error processing image:', err);
    } finally {
      this.isImageLoading.set(false);
    }
  }

  removeMainImage(isEditMode: boolean): void {
    this.mainImageFile.set(null);
    this.mainImagePreview.set(null);
    this.shouldReplaceCoverWithDefault.set(isEditMode);
  }

  async onGalleryChange(files: File[]): Promise<void> {
    if (!files.length) return;

    this.isImageLoading.set(true);
    try {
      for (const file of files) {
        let finalFile: File;
        try {
          finalFile = await this.sharedService.convertHeicToJpg(file);
        } catch (e) {
          console.error('HEIC conversion failed for', file.name, e);
          continue;
        }

        this.galleryFiles.update(files => [...files, finalFile]);

        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            this.galleryPreviews.update(previews => [...previews, reader.result!.toString()]);
          }
        };
        reader.readAsDataURL(finalFile);
      }
    } finally {
      this.isImageLoading.set(false);
    }
  }

  removeGalleryImage(index: number): void {
    this.galleryFiles.update(files => files.filter((_, i) => i !== index));
    this.galleryPreviews.update(previews => previews.filter((_, i) => i !== index));
  }

  async getCoverImageForPayload(defaultCoverImage: string): Promise<File> {
    const currentFile = this.mainImageFile();
    if (currentFile) return currentFile;

    const response = await fetch(defaultCoverImage);
    if (!response.ok) {
      throw new Error('Unable to load default cover image');
    }

    const blob = await response.blob();
    return new File([blob], 'viblooop-default-cover.jpg', { type: blob.type || 'image/jpeg' });
  }

  hydrateForEdit(existingCoverUrl: string | null): void {
    this.mainImageFile.set(null);
    this.mainImagePreview.set(existingCoverUrl);
    this.shouldReplaceCoverWithDefault.set(false);
    this.galleryFiles.set([]);
    this.galleryPreviews.set([]);
  }

  /** Whether the submit payload should fall back to the default cover (edit mode, cover explicitly removed). */
  needsDefaultCoverFallback(): boolean {
    return this.shouldReplaceCoverWithDefault();
  }
}
