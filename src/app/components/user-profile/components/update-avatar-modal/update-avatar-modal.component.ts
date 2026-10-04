import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../shared/services/user/user.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { ToastService } from '../../../../shared/services/toast/toast.service';
import { AuthService } from '../../../../shared/services/auth/auth.service';

@Component({
  selector: 'vl-update-avatar-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './update-avatar-modal.component.html',
  styleUrl: './update-avatar-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateAvatarModalComponent {
  private userService = inject(UserService);
  private sharedService = inject(SharedService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  isOpen = input<boolean>(false);
  currentImage = input<string>('');
  defaultImage = input<string>('assets/images/default-profile.png');

  close = output<void>();
  imageUpdated = output<string>();

  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isUploading = signal<boolean>(false);
  errorMessage = signal<string>('');
  isDragging = signal<boolean>(false);

  readonly maxFileSizeMb = 10;

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.selectedFile.set(null);
        this.previewUrl.set(null);
        this.errorMessage.set('');
        this.isUploading.set(false);
        this.isDragging.set(false);
      }
    });
  }

  get displayImage(): string {
    return this.previewUrl() || this.currentImage() || this.defaultImage();
  }

  get hasSelectedNewPhoto(): boolean {
    return Boolean(this.selectedFile() && this.previewUrl());
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    await this.processFile(file);
  }

  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    this.isDragging.set(false);

    const file = event.dataTransfer?.files?.[0];
    if (!file) return;

    await this.processFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  private async processFile(file: File): Promise<void> {
    this.errorMessage.set('');

    const isImage = file.type.startsWith('image/') || /\.(heic|heif|png|jpg|jpeg|webp|avif)$/i.test(file.name);
    if (!isImage) {
      this.errorMessage.set('Please select a valid image file (JPG, PNG, WebP, HEIC).');
      return;
    }

    if (file.size > this.maxFileSizeMb * 1024 * 1024) {
      this.errorMessage.set(`File size exceeds ${this.maxFileSizeMb}MB. Please choose a smaller photo.`);
      return;
    }

    let finalFile = file;
    try {
      finalFile = await this.sharedService.convertHeicToJpg(file);
    } catch {
      this.errorMessage.set('Unable to convert HEIC image. Please choose another JPG or PNG.');
      return;
    }

    this.selectedFile.set(finalFile);

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl.set(reader.result as string);
    };
    reader.readAsDataURL(finalFile);
  }

  removeSelectedPhoto(): void {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.errorMessage.set('');
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('vl-avatar-modal-backdrop')) {
      this.closeModal();
    }
  }

  closeModal(): void {
    if (this.isUploading()) return;
    this.close.emit();
  }

  saveAvatar(): void {
    const file = this.selectedFile();
    if (!file || this.isUploading()) return;

    this.isUploading.set(true);
    this.errorMessage.set('');

    const formData = new FormData();
    formData.append('profileImage', file);

    this.userService.updateUserProfile(formData).subscribe({
      next: (res: any) => {
        this.isUploading.set(false);
        const newUrl = this.previewUrl() || '';
        this.toastService.success('Profile picture updated successfully!');
        this.imageUpdated.emit(newUrl);
        this.closeModal();
      },
      error: (err: any) => {
        this.isUploading.set(false);
        const msg = err?.error?.message || 'Failed to update profile picture. Please try again.';
        this.errorMessage.set(msg);
      },
    });
  }
}
