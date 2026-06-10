import { Injectable, signal, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private _isLightTheme = signal<boolean>(false);
  isLightTheme = this._isLightTheme.asReadonly();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  setTheme(theme: string) {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
    // Update the signal state
    this._isLightTheme.set(theme === 'dark');
  }

  loadTheme() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
      this.setTheme(saved);
    }
  }
}
