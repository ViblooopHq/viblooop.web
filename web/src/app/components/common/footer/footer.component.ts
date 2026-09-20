import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../../shared/services/theme/theme.service';
import { Environment } from '../../../../environment';

@Component({
  selector: 'vl-footer',
  imports: [NgClass, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  public themeService = inject(ThemeService);
  currentYear = new Date().getFullYear();
  currentAppVersion = Environment.version;
  copyRightInfo = `${this.currentYear} Viblooop. All rights reserved. Version ${this.currentAppVersion}`;

  usefulLinks = [
    { label: 'Terms and Conditions', path: '/terms', icon: 'gavel' },
    { label: 'Privacy Policy', path: '/privacy', icon: 'shield_lock' },
    { label: 'Safety Guidelines', path: '/safety-guidelines', icon: 'verified_user' }
  ];

  socialLinks = [
    { name: 'Facebook', icon: 'fa-facebook-f', url: 'https://facebook.com' },
    { name: 'Twitter', icon: 'fa-x-twitter', url: 'https://x.com' },
    { name: 'Instagram', icon: 'fa-instagram', url: 'https://instagram.com' },
    { name: 'TikTok', icon: 'fa-tiktok', url: 'https://tiktok.com' }
  ];
}
