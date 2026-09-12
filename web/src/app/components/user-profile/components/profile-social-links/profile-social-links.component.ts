import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddSocialModalComponent } from './add-social-modal/add-social-modal.component';
import { ManageSocialDrawerComponent } from './manage-social-drawer/manage-social-drawer.component';
import {
  SocialLink,
  getDisplayHandle,
  getPlatformKey,
  getPlatformLabel,
} from './social-media.models';

export type { SocialLink } from './social-media.models';

@Component({
  selector: 'vl-profile-social-links',
  standalone: true,
  imports: [CommonModule, AddSocialModalComponent, ManageSocialDrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-social-links.component.html',
  styleUrl: './profile-social-links.component.scss',
})
export class ProfileSocialLinksComponent {
  links = input<SocialLink[]>([]);
  isCurrentUser = input<boolean>(false);

  linksUpdated = output<SocialLink[]>();

  isAddModalOpen = signal<boolean>(false);
  isManageDrawerOpen = signal<boolean>(false);

  openAddModal(): void {
    this.isAddModalOpen.set(true);
  }

  closeAddModal(): void {
    this.isAddModalOpen.set(false);
  }

  openManageDrawer(): void {
    this.isManageDrawerOpen.set(true);
  }

  closeManageDrawer(): void {
    this.isManageDrawerOpen.set(false);
  }

  onLinksUpdated(newLinks: SocialLink[]): void {
    this.linksUpdated.emit(newLinks);
  }

  getPlatformKey(platform: string): 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'generic' {
    return getPlatformKey(platform);
  }

  getPlatformLabel(platform: string): string {
    return getPlatformLabel(platform);
  }

  getDisplayHandle(link: SocialLink): string {
    return getDisplayHandle(link);
  }
}
