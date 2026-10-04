import { Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BrowserService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  isBrowserPlatform():boolean {
    return isPlatformBrowser(this.platformId);
  }
}
