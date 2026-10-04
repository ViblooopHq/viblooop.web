import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CreateEventImageUploadService } from '../../state/create-event-image-upload.service';

@Component({
  selector: 'vl-cover-image-upload',
  standalone: true,
  templateUrl: './cover-image-upload.component.html',
  styleUrl: './cover-image-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoverImageUploadComponent {
  private readonly imageUpload = inject(CreateEventImageUploadService);

  readonly defaultCoverImage = input.required<string>();
  readonly isEditMode = input(false);

  readonly isImageLoading = this.imageUpload.isImageLoading;
  readonly mainImagePreview = this.imageUpload.mainImagePreview;
  readonly canRemoveMainImage = this.imageUpload.canRemoveMainImage;

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    void this.imageUpload.onMainImageChange(file);
    input.value = '';
  }

  removeImage(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.imageUpload.removeMainImage(this.isEditMode());
  }
}
