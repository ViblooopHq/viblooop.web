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
  copyRightInfo = `${this.currentYear} Viblooop. All rights reserved.`;
  appVersion = Environment.version;

  usefulLinks = [
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Safety', path: '/safety-guidelines' }
  ];

  socialLinks = [
    { name: 'Instagram', icon: 'fa-instagram', url: 'https://www.instagram.com/viblooop/' },
    { name: 'YouTube', icon: 'fa-youtube', url: 'https://www.youtube.com/@viblooopofficial' }
  ];
}
