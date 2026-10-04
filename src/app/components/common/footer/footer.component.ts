import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../../shared/services/theme/theme.service';

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

  usefulLinks = [
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Safety', path: '/safety-guidelines' }
  ];

  socialLinks = [
    { name: 'Instagram', icon: 'fa-instagram', url: 'https://instagram.com' },
    { name: 'LinkedIn', icon: 'fa-linkedin-in', url: 'https://linkedin.com' },
    { name: 'Facebook', icon: 'fa-facebook-f', url: 'https://facebook.com' }
  ];
}
