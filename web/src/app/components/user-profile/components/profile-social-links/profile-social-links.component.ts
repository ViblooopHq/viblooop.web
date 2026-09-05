import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SocialLink = {
  platform: string;
  url: string;
};

@Component({
  selector: 'vl-profile-social-links',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-social-links.component.html',
  styleUrl: './profile-social-links.component.scss',
})
export class ProfileSocialLinksComponent {
  links = input<SocialLink[]>([]);
  isCurrentUser = input<boolean>(false);
  addSocial = output<void>();

  getPlatformKey(platform: string): 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'generic' {
    const key = (platform || '').toLowerCase().trim();
    if (key.includes('insta')) return 'instagram';
    if (key.includes('twit') || key === 'x') return 'twitter';
    if (key.includes('linked')) return 'linkedin';
    if (key.includes('you') || key.includes('yt')) return 'youtube';
    return 'generic';
  }

  getPlatformLabel(platform: string): string {
    switch (this.getPlatformKey(platform)) {
      case 'instagram':
        return 'Instagram';
      case 'twitter':
        return 'X (Twitter)';
      case 'linkedin':
        return 'LinkedIn';
      case 'youtube':
        return 'YouTube';
      default:
        return 'Website';
    }
  }

  getDisplayHandle(link: SocialLink): string {
    const url = (link?.url || '').trim();
    if (!url) return this.getPlatformLabel(link.platform);

    try {
      // Remove protocol
      const cleaned = url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
      const parts = cleaned.split('/');

      if (this.getPlatformKey(link.platform) === 'instagram' && parts.length > 1) {
        return `@${parts[1].replace('@', '')}`;
      }
      if (this.getPlatformKey(link.platform) === 'twitter' && parts.length > 1) {
        return `@${parts[1].replace('@', '')}`;
      }
      if (this.getPlatformKey(link.platform) === 'youtube' && parts.length > 1) {
        return parts[1].startsWith('@') ? parts[1] : `@${parts[1]}`;
      }
      if (this.getPlatformKey(link.platform) === 'linkedin' && parts.length > 2 && parts[1] === 'in') {
        return `in/${parts[2]}`;
      }
      return parts[parts.length - 1] || this.getPlatformLabel(link.platform);
    } catch {
      return this.getPlatformLabel(link.platform);
    }
  }
}
