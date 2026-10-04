import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../../shared/services/user/user.service';
import { ToastService } from '../../../../../shared/services/toast/toast.service';
import {
  SUPPORTED_SOCIAL_PLATFORMS,
  SocialLink,
  SocialPlatformConfig,
  SocialPlatformKey,
  getPlatformKey,
  getPlatformLabel,
  normalizeSocialUrl,
} from '../social-media.models';

@Component({
  selector: 'vl-add-social-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-social-modal.component.html',
  styleUrl: './add-social-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSocialModalComponent {
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  isOpen = input<boolean>(false);
  existingLinks = input<SocialLink[]>([]);

  close = output<void>();
  linksUpdated = output<SocialLink[]>();

  selectedPlatformKey = signal<SocialPlatformKey>('instagram');
  handleDraft = signal<string>('');
  isSaving = signal<boolean>(false);
  errorMessage = signal<string>('');

  readonly supportedPlatforms = SUPPORTED_SOCIAL_PLATFORMS;

  // Compute available platforms that have not yet been added
  availablePlatforms = computed(() => {
    const existingKeys = new Set(
      this.existingLinks().map((link) => getPlatformKey(link.platform))
    );
    return this.supportedPlatforms.filter((p) => !existingKeys.has(p.key));
  });

  selectedPlatform = computed(() => {
    const key = this.selectedPlatformKey();
    const found = this.supportedPlatforms.find((p) => p.key === key);
    return found || this.availablePlatforms()[0] || this.supportedPlatforms[0];
  });

  formattedPreviewUrl = computed(() => {
    const raw = this.handleDraft().trim();
    if (!raw) return '';
    return normalizeSocialUrl(raw, this.selectedPlatform().key);
  });

  constructor() {
    // When available platforms change or modal opens, pick the first available platform
    effect(() => {
      const avail = this.availablePlatforms();
      const current = this.selectedPlatformKey();
      if (avail.length > 0 && !avail.some((p) => p.key === current)) {
        this.selectedPlatformKey.set(avail[0].key);
      }
    });

    // Reset draft on modal open
    effect(() => {
      if (this.isOpen()) {
        this.handleDraft.set('');
        this.errorMessage.set('');
        this.isSaving.set(false);
        const avail = this.availablePlatforms();
        if (avail.length > 0) {
          this.selectedPlatformKey.set(avail[0].key);
        }
      }
    });
  }

  selectPlatform(platform: SocialPlatformConfig): void {
    this.selectedPlatformKey.set(platform.key);
    this.errorMessage.set('');
  }

  onDraftChange(value: string): void {
    this.handleDraft.set(value);
    if (this.errorMessage()) {
      this.errorMessage.set('');
    }
  }

  clearDraft(): void {
    this.handleDraft.set('');
    this.errorMessage.set('');
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('vl-add-social-backdrop')) {
      this.closeModal();
    }
  }

  closeModal(): void {
    if (this.isSaving()) return;
    this.close.emit();
  }

  saveSocialLink(): void {
    const rawValue = this.handleDraft().trim();
    if (!rawValue) {
      this.errorMessage.set('Please enter your username or profile link.');
      return;
    }

    const platform = this.selectedPlatform();
    const normalizedUrl = normalizeSocialUrl(rawValue, platform.key);

    if (!normalizedUrl) {
      this.errorMessage.set(`Please enter a valid ${platform.label} handle or profile URL.`);
      return;
    }

    // Check if already added
    const current = this.existingLinks();
    const platformKey = platform.key;
    const existingIndex = current.findIndex((l) => getPlatformKey(l.platform) === platformKey);

    let updatedLinks: SocialLink[];
    if (existingIndex > -1) {
      updatedLinks = current.map((l, i) => (i === existingIndex ? { platform: platformKey, url: normalizedUrl } : l));
    } else {
      updatedLinks = [...current, { platform: platformKey, url: normalizedUrl }];
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    const formData = new FormData();
    formData.append('socialLinks', JSON.stringify(updatedLinks));

    this.userService.updateUserProfile(formData).subscribe({
      next: (res: any) => {
        this.isSaving.set(false);
        this.toastService.success(`${platform.label} profile connected!`);
        this.linksUpdated.emit(updatedLinks);
        this.closeModal();
      },
      error: (err: any) => {
        this.isSaving.set(false);
        const msg = err?.error?.message || 'Failed to save social link. Please try again.';
        this.errorMessage.set(msg);
      },
    });
  }
}
