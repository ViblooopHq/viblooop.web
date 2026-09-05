import { Component, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import { SocketService } from '../../services/socket/socket.service';
import { SharedService } from '../../services/shared.service';
import { HttpService } from '../../services/http/http.service';
import { Environment } from '../../../../environment';
import { BrowserService } from '../../services/browser/browser.service';
import { Router } from '@angular/router';
import { RouteService } from '../../services/route/route.service';
import { OutsideClickDirective } from '../../../directives/outside-click.directive';
import { FormDrawerComponent } from '../form-drawer/form-drawer.component';

export enum NotificationType {
  JOIN_REQUEST = "JOIN_REQUEST",
  JOIN_REQUEST_ACCEPTED = "JOIN_REQUEST_ACCEPTED",
  JOIN_REQUEST_REJECTED = "JOIN_REQUEST_REJECTED",
  EVENT_REMINDER = "EVENT_REMINDER",
  EVENT_UPDATED = "EVENT_UPDATED",
  EVENT_LEFT = "EVENT_LEFT",
  REVIEW = "REVIEW",
  SYSTEM = "SYSTEM",
}

@Component({
  selector: 'vl-notification',
  imports: [OutsideClickDirective, FormDrawerComponent],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent {
  @Input() presentation: 'page' | 'popover' = 'page';
  @Output() panelClosed = new EventEmitter<void>();

  notifications: any[] = [];
  notificationType = NotificationType;
  defaultProfileImage = 'assets/images/default-profile.png';
  mainService = inject(SharedService)
  socketService = inject(SocketService)
  httpService = inject(HttpService)
  platform = inject(BrowserService)
  private router = inject(Router)
  private routeService = inject(RouteService)
  private readonly pendingSeenNotificationIds = new Set<string>();

  // Track state of actions for each notification
  actionStates: { [key: string]: 'pending' | 'processing' | 'accepted' | 'rejected' } = {};

  goBack(): void {
    if (this.presentation === 'popover') {
      this.panelClosed.emit();
    } else {
      this.routeService.closeDrawerOrNavigate('/');
    }
  }

  ngOnInit() {
    this.initSocketSubscriptions();
    this.redirectDesktopPageToHome();
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.redirectDesktopPageToHome();
  }

  initSocketSubscriptions() {
    this.socketService.notifications$.subscribe((notifications) => {
      this.notifications = notifications;
      this.computeNotification(notifications);
    });
  }

  computeNotification(notifications: any[]) {
    this.notifications = notifications || [];
    this.markSeenNotificationsWithoutAction();
  }

  closePanel() {
    this.panelClosed.emit();

    if (this.presentation === 'page') {
      this.routeService.closeDrawerOrNavigate('/');
    }
  }

  handleOutsideClick() {
    if (this.presentation === 'popover') {
      this.closePanel();
    }
  }

  private redirectDesktopPageToHome() {
    if (
      this.presentation === 'page' &&
      this.platform.isBrowserPlatform() &&
      window.matchMedia('(min-width: 768px)').matches &&
      !this.router.url.includes('(drawer:notifications)') &&
      this.router.url.startsWith('/notifications')
    ) {
      this.router.navigateByUrl('/', { replaceUrl: true });
    }
  }

  markAsRead(notificationId: string) {
    if (!notificationId) return;
    this.socketService.markNotificationAsRead(notificationId);
  }

  private markSeenNotificationsWithoutAction(): void {
    const notificationIds = this.notifications
      .filter((notification) => !notification?.read && !this.notificationRequiresAction(notification))
      .map((notification) => this.getNotificationId(notification))
      .filter((notificationId) => notificationId && !this.pendingSeenNotificationIds.has(notificationId));

    if (!notificationIds.length) return;

    notificationIds.forEach((notificationId) => this.pendingSeenNotificationIds.add(notificationId));
    this.notifications = this.notifications.map((notification) =>
      notificationIds.includes(this.getNotificationId(notification))
        ? { ...notification, read: true }
        : notification
    );
    this.socketService.markNotificationsAsRead(notificationIds);
  }

  private notificationRequiresAction(notification: any): boolean {
    return notification?.type === NotificationType.JOIN_REQUEST
      && this.notificationState(notification) === 'pending';
  }

  calculateTimeAgo(date: string): string {
    return this.mainService.calculateTimeAgo(date);
  }

  calculateShortTimeAgo(date: string): string {
    const timestamp = new Date(date).getTime();
    if (Number.isNaN(timestamp)) return '';

    const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return `${weeks}w`;
  }

  notificationIcon(notification: any): string {
    switch (notification?.type) {
      case NotificationType.JOIN_REQUEST:
        return 'group_add';
      case NotificationType.JOIN_REQUEST_ACCEPTED:
        return 'check_circle';
      case NotificationType.JOIN_REQUEST_REJECTED:
      case NotificationType.EVENT_LEFT:
        return 'person_remove';
      case NotificationType.EVENT_REMINDER:
        return 'calendar_month';
      case NotificationType.EVENT_UPDATED:
        return 'campaign';
      case NotificationType.REVIEW:
        return 'rate_review';
      default:
        return 'notifications';
    }
  }

  notificationIconClass(notification: any): string {
    return `notification-icon ${this.notificationTone(notification)}`;
  }

  notificationSenderImage(notification: any): string {
    const image =
      notification?.senderImage ||
      notification?.sender?.profileImage ||
      notification?.senderId?.profileImage ||
      '';

    return this.mainService.getImageUrl(image) || this.defaultProfileImage;
  }

  handleSenderImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.src = this.defaultProfileImage;
  }

  notificationState(notification: any): 'pending' | 'processing' | 'accepted' | 'rejected' | 'idle' {
    const localState = this.actionStates[notification?._id];
    if (localState) return localState;

    const status = String(notification?.status || '').toLowerCase();
    if (status === 'processing' || status === 'accepted' || status === 'rejected' || status === 'pending') {
      return status;
    }

    if (notification?.type === NotificationType.JOIN_REQUEST) {
      return 'pending';
    }

    return 'idle';
  }

  notificationTone(notification: any): string {
    switch (notification?.type) {
      case NotificationType.JOIN_REQUEST:
        return 'tone-request';
      case NotificationType.JOIN_REQUEST_ACCEPTED:
        return 'tone-success';
      case NotificationType.JOIN_REQUEST_REJECTED:
      case NotificationType.EVENT_LEFT:
        return 'tone-danger';
      case NotificationType.EVENT_REMINDER:
        return 'tone-reminder';
      case NotificationType.EVENT_UPDATED:
        return 'tone-review';
      case NotificationType.REVIEW:
        return 'tone-review';
      default:
        return 'tone-system';
    }
  }

  notificationSubtitle(notification: any): string {
    const eventTitle =
      notification?.eventTitle ||
      notification?.eventName ||
      notification?.event?.title ||
      notification?.eventId?.title ||
      notification?.title;

    if (eventTitle) {
      return eventTitle;
    }

    const quotedTitle = typeof notification?.message === 'string'
      ? notification.message.match(/"([^"]+)"/)
      : null;

    return quotedTitle?.[1] || '';
  }

  redirectToEvent(eventId: string) {
    if (!eventId) return;

    if (this.platform.isBrowserPlatform()) {
      this.router.navigateByUrl(`/events/${eventId}`);
    }
  }

  redirectToNotificationEvent(notification: any): void {
    const eventId = this.getNotificationEventId(notification);
    if (!eventId) return;

    if (this.presentation === 'popover') {
      this.panelClosed.emit();
    } else {
      this.routeService.closeDrawer();
    }
    this.redirectToEvent(eventId);
  }

  redirectToUserProfile(userId: string) {
    if (!userId) return;

    if (this.router.url.startsWith('/profile')) {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigateByUrl('/profile', { state: { userId } });
      });
      return;
    }

    this.router.navigateByUrl('/profile', { state: { userId } });
  }

  redirectToNotificationSender(notification: any): void {
    const senderId = this.getNotificationSenderId(notification);
    if (!senderId) return;

    if (this.presentation === 'popover') {
      this.panelClosed.emit();
    } else {
      this.routeService.closeDrawer();
    }
    this.redirectToUserProfile(senderId);
  }

  acceptJoinRequest(notification: any) {
    if (!notification) return;

    this.actionStates[notification._id] = 'processing';

    this.httpService.post(Environment.apiBaseUrl + "/acceptJoinRequest", {
      eventId: this.getNotificationEventId(notification),
      userId: notification.senderId,
    }).subscribe({
      next: (res) => {
        this.actionStates[notification._id] = 'accepted';
        // The list will eventually update via socket, but we show feedback first
      },
      error: (err) => {
        this.actionStates[notification._id] = 'pending';
        console.error('Accept fail:', err);
      }
    });
  }

  rejectJoinRequest(notification: any) {
    if (!notification) return;

    this.actionStates[notification._id] = 'processing';

    this.httpService.post(Environment.apiBaseUrl + "/rejectJoinEventRequest", {
      eventId: this.getNotificationEventId(notification),
      userId: notification.senderId,
    }).subscribe({
      next: (res) => {
        this.actionStates[notification._id] = 'rejected';
      },
      error: (err) => {
        this.actionStates[notification._id] = 'pending';
        console.error('Reject fail:', err);
      }
    });
  }

  getNotificationEventId(notification: any): string {
    return notification?.eventId?._id || notification?.eventId || '';
  }

  getNotificationSenderId(notification: any): string {
    return notification?.senderId?._id || notification?.sender?._id || notification?.senderId || '';
  }

  private getNotificationId(notification: any): string {
    return notification?._id || notification?.id || '';
  }

}
