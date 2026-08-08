import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type SocialLink = {
  platform: string;
  url: string;
};

@Component({
  selector: 'vl-profile-social-links',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-social-links.component.html',
  styleUrl: './profile-social-links.component.scss',
})
export class ProfileSocialLinksComponent {
  links = input<SocialLink[]>([]);

  getSocialIcon(platform: string): string {
    switch ((platform || '').toLowerCase()) {
      case 'instagram':
        return 'fa-brands fa-instagram';
      case 'twitter':
        return 'fa-brands fa-twitter';
      case 'youtube':
        return 'fa-brands fa-youtube';
      case 'linkedin':
        return 'fa-brands fa-linkedin-in';
      default:
        return 'fa-solid fa-link';
    }
  }

  getSocialLabel(platform: string): string {
    switch ((platform || '').toLowerCase()) {
      case 'instagram':
        return 'Instagram';
      case 'twitter':
        return 'Twitter';
      case 'youtube':
        return 'YouTube';
      case 'linkedin':
        return 'LinkedIn';
      default:
        return 'Profile link';
    }
  }
}
