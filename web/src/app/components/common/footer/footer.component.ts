import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { Environment } from '../../../../environment';

@Component({
  selector: 'vl-footer',
  imports: [NgClass],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  currentAppVersion = Environment.version;
  copyRightInfo = `${this.currentYear} Viblooop. All rights reserved. Version ${this.currentAppVersion}`;

  quickLinks = [
    { label: 'Home', url: '/' },
    { label: 'Discover', url: '/discover' },
    { label: 'My Events', url: '/my-events' },
    { label: 'Messages', url: '/messages' }
  ];

  communityLinks = [
    { label: 'Verified Vibes', url: '#' },
    { label: 'Safety Guidelines', url: '#' },
    { label: 'Code of Conduct', url: '#' },
    { label: 'Join the Crew', url: '#' }
  ];

  supportLinks = [
    { label: 'Help Center', url: '#' },
    { label: 'Terms of Service', url: '#' },
    { label: 'Privacy Policy', url: '#' },
    { label: 'Contact Us', url: '/contact' }
  ];

  socialLinks = [
    { name: 'Facebook', icon: 'fa-facebook-f', url: '#' },
    { name: 'Twitter', icon: 'fa-x-twitter', url: '#' },
    { name: 'Instagram', icon: 'fa-instagram', url: '#' },
    { name: 'TikTok', icon: 'fa-tiktok', url: '#' }
  ];
}
