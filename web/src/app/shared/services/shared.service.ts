import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, of } from 'rxjs';
import { BrowserService } from './browser/browser.service';
import { Environment } from '../../../environment';
import { NotificationService } from './notification/notification.service';
import { SocketService } from './socket/socket.service';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  logInbaseUrl = Environment.authBaseUrl;
  baseUrl = Environment.apiBaseUrl;
  imageBaseUrl = Environment.imageBaseUrl;
  notificationCount = signal(0)
  chatConversationsRequest = signal(0)
  authService = inject(AuthService)
  http = inject(HttpClient)
  platform = inject(BrowserService)

  constructor() { }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';

    if (imagePath.includes('uploads')) {
      return this.authService.imageBaseUrl + imagePath.replace(/\\/g, '/');
    } else {
      return imagePath;
    }
  }

  requestChatConversations() {
    this.chatConversationsRequest.update((count) => count + 1);
  }

  isHeicImage(file: File): boolean {
    const fileName = file.name.toLowerCase();
    return file.type === 'image/heic' ||
      file.type === 'image/heif' ||
      fileName.endsWith('.heic') ||
      fileName.endsWith('.heif');
  }

  async convertHeicToJpg(file: File, quality = 0.8): Promise<File> {
    if (!this.isHeicImage(file)) return file;

    if (!this.platform.isBrowserPlatform()) {
      throw new Error('HEIC conversion is only available in the browser.');
    }

    const heicModule = await import('heic2any');
    const heic2any = heicModule.default || heicModule;
    const blob = await (heic2any as any)({
      blob: file,
      toType: 'image/jpeg',
      quality,
    });
    const convertedBlob = Array.isArray(blob) ? blob[0] : blob;
    const jpgName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
    const finalName = jpgName === file.name ? `${file.name}.jpg` : jpgName;

    return new File([convertedBlob], finalName, { type: 'image/jpeg' });
  }

  calculateTimeAgo(date: string): string {
    const today = new Date();
    const notificationDate = new Date(date);
    const timeDiff = today.getTime() - notificationDate.getTime();

    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    } else if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (days < 7) {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else if (weeks < 5) {
      return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    } else if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''} ago`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} ago`;
    }
  }

  viewProfile(userId: string) {
    return forkJoin({
      profile: this.http.post(`${this.authService.baseUrl}/getUserProfile`, { userId: userId }),
      attendedEvents: this.http.post(`${this.authService.baseUrl}/getAllAttendedEvents`, { userId: userId }),
      createdEvents: this.http.post(`${this.authService.baseUrl}/getAllEventsByUser`, { userId: userId }),
      eventsGallery: this.http.post(`${this.authService.baseUrl}/getAllEventsImagesByUser`, { userId: userId }),
      userReviews: this.getUserReviews(userId).pipe(
        catchError(() => of({ success: false, statusCode: 500, data: null }))
      )
    });
  }

  getUserReviews(userId: string) {
    return this.http.post(`${this.authService.baseUrl}/review/getUserReview`, { userId: userId });
  }

  getAttendedEvents(userId: string) {
    return this.http.post(`${this.authService.baseUrl}/getAllAttendedEvents`, { userId: userId });
  }

  getCreatedEvents(userId: string) {
    return this.http.post(`${this.authService.baseUrl}/getAllEventsByUser`, { userId: userId });
  }

  getEventsGallery(userId: string) {
    return this.http.post(`${this.authService.baseUrl}/getAllEventsImagesByUser`, { userId: userId });
  }

  getFromLocalStorage(key: string): any {
    if (this.platform.isBrowserPlatform()) {
      return localStorage.getItem(key);
    }
    return null;
  }

  setToLocalStorage(key: string, data: any) {
    if (this.platform.isBrowserPlatform()) {
      localStorage.setItem(key, data);
    }
  }

  removeFromLocalStorage(key: string) {
    if (this.platform.isBrowserPlatform()) {
      localStorage.removeItem(key);
    }
  }
}
