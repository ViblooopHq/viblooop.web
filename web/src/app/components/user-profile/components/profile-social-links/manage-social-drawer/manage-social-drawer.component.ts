import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormDrawerComponent } from '../../../../../shared/components/form-drawer/form-drawer.component';
import { UserService } from '../../../../../shared/services/user/user.service';
import { ToastService } from '../../../../../shared/services/toast/toast.service';
import {
  SUPPORTED_SOCIAL_PLATFORMS,
  SocialLink,
  SocialPlatformConfig,
  SocialPlatformKey,
  getDisplayHandle,
  getPlatformKey,
  getPlatformLabel,
  normalizeSocialUrl,
} from '../social-media.models';

@Component({
  selector: 'vl-manage-social-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, FormDrawerComponent],
  templateUrl: './manage-social-drawer.component.html',
  styleUrl: './manage-social-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageSocialDrawerComponent {
  @ViewChild(FormDrawerComponent) formDrawer?: FormDrawerComponent;

  private userService = inject(UserService);
  private toastService = inject(ToastService);

  isOpen = input<boolean>(false);
  links = input<SocialLink[]>([]);

  close = output<void>();
  linksUpdated = output<SocialLink[]>();

  readonly supportedPlatforms = SUPPORTED_SOCIAL_PLATFORMS;

  // Track draft input for each platform: key -> string
  inlineDrafts = signal<Record<string, string>>({});
  // Track error messages for each platform: key -> string
  inlineErrors = signal<Record<string, string>>({});
  // Track currently saving/deleting platform
  savingPlatform = signal<string | null>(null);
  deletingPlatform = signal<string | null>(null);

  // Available platforms (not in current links)
  availablePlatforms = computed(() => {
    const currentKeys = new Set(
      this.links().map((link) => getPlatformKey(link.platform))
    );
    return this.supportedPlatforms.filter((p) => !currentKeys.has(p.key));
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.inlineDrafts.set({});
        this.inlineErrors.set({});
        this.savingPlatform.set(null);
        this.deletingPlatform.set(null);
      }
    });
  }

  getHandle(link: SocialLink): string {
    return getDisplayHandle(link);
  }

  getLabel(platform: string): string {
    return getPlatformLabel(platform);
  }

  getKey(platform: string): string {
    return getPlatformKey(platform);
  }

  getDraft(key: string): string {
    return this.inlineDrafts()[key] || '';
  }

  setDraft(key: string, value: string): void {
    this.inlineDrafts.update((drafts) => ({ ...drafts, [key]: value }));
    if (this.inlineErrors()[key]) {
      this.inlineErrors.update((errors) => ({ ...errors, [key]: '' }));
    }
  }

  getError(key: string): string {
    return this.inlineErrors()[key] || '';
  }

  setError(key: string, msg: string): void {
    this.inlineErrors.update((errors) => ({ ...errors, [key]: msg }));
  }

  triggerClose(): void {
    if (this.savingPlatform() || this.deletingPlatform()) return;
    if (this.formDrawer) {
      this.formDrawer.closeDrawer();
    } else {
      this.close.emit();
    }
  }

  onDrawerClosed(): void {
    this.close.emit();
  }

  deleteLink(link: SocialLink): void {
    const key = getPlatformKey(link.platform);
    if (this.deletingPlatform() || this.savingPlatform()) return;

    this.deletingPlatform.set(key);
    const updated = this.links().filter((l) => getPlatformKey(l.platform) !== key);

    const formData = new FormData();
    formData.append('socialLinks', JSON.stringify(updated));

    this.userService.updateUserProfile(formData).subscribe({
      next: () => {
        this.deletingPlatform.set(null);
        this.toastService.success(`${getPlatformLabel(link.platform)} profile removed.`);
        this.linksUpdated.emit(updated);
      },
      error: (err: any) => {
        this.deletingPlatform.set(null);
        const msg = err?.error?.message || 'Failed to remove social link. Please try again.';
        this.toastService.error(msg);
      },
    });
  }

  connectPlatform(platform: SocialPlatformConfig): void {
    const draft = this.getDraft(platform.key).trim();
    if (!draft) {
      this.setError(platform.key, 'Please enter your username or URL.');
      return;
    }

    const normalizedUrl = normalizeSocialUrl(draft, platform.key);
    if (!normalizedUrl) {
      this.setError(platform.key, `Please enter a valid ${platform.label} username or profile URL.`);
      return;
    }

    this.savingPlatform.set(platform.key);
    this.setError(platform.key, '');

    const current = this.links();
    const existingIndex = current.findIndex((l) => getPlatformKey(l.platform) === platform.key);

    let updated: SocialLink[];
    if (existingIndex > -1) {
      updated = current.map((l, i) => (i === existingIndex ? { platform: platform.key, url: normalizedUrl } : l));
    } else {
      updated = [...current, { platform: platform.key, url: normalizedUrl }];
    }

    const formData = new FormData();
    formData.append('socialLinks', JSON.stringify(updated));

    this.userService.updateUserProfile(formData).subscribe({
      next: () => {
        this.savingPlatform.set(null);
        this.setDraft(platform.key, '');
        this.toastService.success(`${platform.label} connected!`);
        this.linksUpdated.emit(updated);
      },
      error: (err: any) => {
        this.savingPlatform.set(null);
        const msg = err?.error?.message || 'Failed to connect platform. Please try again.';
        this.setError(platform.key, msg);
      },
    });
  }
}
