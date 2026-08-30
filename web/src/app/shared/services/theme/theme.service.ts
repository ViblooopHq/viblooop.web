import { Injectable, signal, computed, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private _theme = signal<'dark' | 'light'>('dark');
  theme = this._theme.asReadonly();
  isLightTheme = computed(() => this._theme() === 'light');
  isDarkTheme = computed(() => this._theme() === 'dark');

  // Dynamic logo SVG based on current theme
  logoSrc = computed(() => (this._theme() === 'light' ? 'logo-light.svg' : 'logo-dark.svg'));

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  setTheme(theme: string) {
    const activeTheme = theme === 'light' ? 'light' : 'dark';
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.setAttribute('data-theme', activeTheme);
      localStorage.setItem('theme', activeTheme);
    }
    this._theme.set(activeTheme);
  }

  loadTheme() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
      this.setTheme(saved);
    }
  }
}
