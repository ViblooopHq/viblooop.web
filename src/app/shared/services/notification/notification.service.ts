import { inject, Injectable } from '@angular/core';
import { deleteToken, getToken, Messaging, onMessage } from '@angular/fire/messaging';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BrowserService } from '../browser/browser.service';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private VAPID_PUBLIC_KEY = 'BNwtY28kNtbJGclvRNp_w8bDKb30n24FoML-azegKMVIfpR2xa71oGAVnjdUWdmmrmYjZ8J55eYkr-_JgmbF99Y';
  private messaging = inject(Messaging);
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private browserService = inject(BrowserService);

  async initNotifications() {
    if (!this.browserService.isBrowserPlatform()) return;
    try {
      if (!this.isNotificationSupported()) return;

      const permission = await this.requestPermission();
      if (permission !== 'granted') return;

      this.listenToForegroundMessages();

      const registration = await this.registerServiceWorker();
      const token = await this.getFcmToken(registration);

      if (!token) {
        console.log('⚠️ No FCM token generated');
        return;
      }

      console.log('✅ FCM token fetched:', token);

      // Always register token on login to ensure backend sync
      this.registerFCMToken(token).subscribe((response) => {
        if (response?.success) {
          console.log('🚀 FCM Token successfully synced with backend');
          localStorage.setItem('fcmToken', token);
        } else {
          console.warn('❌ FCM Token sync failed:', response?.message);
        }
      });
    } catch (error) {
      console.error('🔥 Notification init failed:', error);
    }
  }

  private isNotificationSupported(): boolean {
    if (!this.browserService.isBrowserPlatform()) return false;
    if (!('Notification' in window)) {
      console.log('❌ Notifications not supported');
      return false;
    }
    return true;
  }

  private async requestPermission(): Promise<NotificationPermission> {
    const permission = await Notification.requestPermission();
    console.log(`🔐 Permission: ${permission}`);
    return permission;
  }

  private async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    const swPath = '/firebase-messaging-sw.js';

    // Check if already registered
    const registration = await navigator.serviceWorker.getRegistration(swPath);
    if (registration) {
      await navigator.serviceWorker.ready;
      return registration;
    }

    // Register and wait for it to be ready
    const newReg = await navigator.serviceWorker.register(swPath);
    await navigator.serviceWorker.ready;
    return newReg;
  }

  private async getFcmToken(
    registration: ServiceWorkerRegistration
  ): Promise<string | null> {
    try {
      return await getToken(this.messaging, {
        vapidKey: this.VAPID_PUBLIC_KEY,
        serviceWorkerRegistration: registration
      });
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      return null;
    }
  }

  private listenToForegroundMessages() {
    onMessage(this.messaging, (payload) => {
      console.log('🔔 Foreground message:', payload);

      if (Notification.permission === 'granted') {
        new Notification(
          payload.notification?.title ?? 'Notification',
          {
            body: payload.notification?.body ?? ''
          }
        );
      }
    });
  }

  async deleteFcmToken() {
    try {
      await deleteToken(this.messaging);
      console.log('✅ FCM token deleted');
    } catch (error) {
      console.error('❌ Error deleting FCM token:', error);
    }
  }

  public registerFCMToken(token: any): Observable<any> {
    return this.http.post(`${this.authService.baseUrl}/register-fcm-token`, { fcmToken: token });
  }

  public deleteFCMToken(token: any): Observable<any> {
    return this.http.post(`${this.authService.baseUrl}/api/delete-fcm-token`, token);
  }


}
