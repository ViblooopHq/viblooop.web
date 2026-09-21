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
  copyRightInfo = `${this.currentYear} Viblooop`;

  usefulLinks = [
    { label: 'Terms', path: '/terms' },
    { label: 'Privacy', path: '/privacy' },
    { label: 'Safety', path: '/safety-guidelines' }
  ];

  socialLinks = [
    { name: 'Facebook', icon: 'fa-facebook-f', url: 'https://facebook.com' },
    { name: 'Twitter', icon: 'fa-x-twitter', url: 'https://x.com' },
    { name: 'Instagram', icon: 'fa-instagram', url: 'https://instagram.com' }
  ];
}
