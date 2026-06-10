import { inject, Injectable } from '@angular/core';
import { BrowserService } from '../browser/browser.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  platform = inject(BrowserService)
  constructor() { }

  getFromLocalStorage(key: string):any {
    if (this.platform.isBrowserPlatform()) {
      return localStorage.getItem(key);
    }
    return null;
  }

  setToLocalStorage(key: string, data:any) {
     if (this.platform.isBrowserPlatform()) {
      localStorage.setItem(key, data);
     }
  }

  removeFromLocalStorage(key:string) {
     if (this.platform.isBrowserPlatform()) {
      localStorage.removeItem(key);
     }
  }

  getFromSessionStorage(key: string):any {
    if (this.platform.isBrowserPlatform()) {
      return sessionStorage.getItem(key);
    }
    return null;
  }

  setToSessionStorage(key: string, data:any) {
     if (this.platform.isBrowserPlatform()) {
      sessionStorage.setItem(key, data);
     }
  }

  removeFromSessionStorage(key:string) {
     if (this.platform.isBrowserPlatform()) {
      sessionStorage.removeItem(key);
     }
  }
}
