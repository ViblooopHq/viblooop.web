import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Messaging, deleteToken, getToken, onMessage } from '@angular/fire/messaging';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class WebPushService {
  // private VAPID_PUBLIC_KEY = 'BN6_Bg6uTKV2tfrQz5TQdvmgv7N-FoYLwKe5UyksVsdtWJ42gVUz_QJzc0XD4CQF0nxf6_hH3JHyCmAuhxSZam8';
  private VAPID_PUBLIC_KEY = 'BHAMQgWgPAziYj_ICw-oHNTXSoTjsyu9T0K2V5LI2XwsnC8fBPNTe_fvLXuti1MSqpyR9JfVVxOhs4XdZwmGkOI';
  private platformId = inject(PLATFORM_ID);
  private messaging = inject(Messaging);
  message$ = new Observable();

  // constructor(private msg: Messaging) {
  //   if (!('Notification' in window)) {
  //     console.log('This browser does not support notifications.');
  //     return;
  //   }
  //   Notification.requestPermission().then(
  //     (notificationPermissions: NotificationPermission) => {
  //       if (notificationPermissions === "granted") {
  //         console.log("Granted");
  //       }
  //       if (notificationPermissions === "denied") {
  //         console.log("Denied");
  //       }
  //     });

  //   navigator.serviceWorker
  //     .register("firebase-messaging-sw.js", {
  //       type: "module",
  //     })
  //     .then((serviceWorkerRegistration) => {
  //       getToken(this.msg, {
  //         vapidKey: `BHAMQgWgPAziYj_ICw-oHNTXSoTjsyu9T0K2V5LI2XwsnC8fBPNTe_fvLXuti1MSqpyR9JfVVxOhs4XdZwmGkOI`,
  //         serviceWorkerRegistration: serviceWorkerRegistration,
  //       }).then((x) => {
  //         console.log('my fcm token', x);
  //         // This is a good place to then store it on your database for each user
  //       });
  //     });

  //   this.message$ = new Observable((sub) => onMessage(this.msg, (msg) =>
  //     sub.next(msg))).pipe(
  //       tap((msg) => {
  //         console.log("My Firebase Cloud Message", msg);
  //       })
  //     );
  // }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.requestNotificationPermission();
      this.listenForForegroundMessages();
    }
  }

  async requestNotificationPermission() {
    try {
      const token = await getToken(this.messaging, {
        vapidKey: this.VAPID_PUBLIC_KEY
      });
      if (token) {
        console.log('FCM Token:', token);
        // Send to your Node.js backend via HttpClient
      }
    } catch (err) {
      console.error('Permission denied or error:', err);
    }
  }

  listenForForegroundMessages() {
    onMessage(this.messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      // Use a Toast library or SnackBar here
    });
  }

  async deleteToken() {
    await deleteToken(this.messaging);
  }

}
