import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { Subscription } from 'rxjs';
import { SocketService } from '../socket/socket.service';

export type EventJoinStatus = 'none' | 'pending' | 'accepted' | 'rejected';
export type EventJoinButtonLabel = 'Request Join' | 'Requested' | 'Joined';

type EventJoinStatusState = {
  statuses: Record<string, EventJoinStatus>;
  handledNotificationIds: Record<string, boolean>;
};

const initialState: EventJoinStatusState = {
  statuses: {},
  handledNotificationIds: {},
};

export const EventJoinStatusStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    statusFor(eventId: string): EventJoinStatus {
      return getStatusForEvent(store.statuses(), eventId);
    },

    labelFor(eventId: string): EventJoinButtonLabel {
      return getLabelForStatus(getStatusForEvent(store.statuses(), eventId));
    },

    canRequestJoin(eventId: string): boolean {
      const status = getStatusForEvent(store.statuses(), eventId);
      return status === 'none' || status === 'rejected';
    },

    setStatus(eventId: string, status: EventJoinStatus): void {
      if (!eventId) return;

      patchState(store, (state) => ({
        statuses: {
          ...state.statuses,
          [eventId]: status,
        },
      }));
    },

    setApiStatus(eventId: string, status: string | null | undefined): void {
      this.setStatus(eventId, normalizeStatus(status));
    },

    applyNotification(notification: any): void {
      const notificationId = getNotificationId(notification);
      const eventId = getNotificationEventId(notification);
      const notificationType = notification?.type;

      if (!eventId || (notificationId && store.handledNotificationIds()[notificationId])) return;

      if (notificationType !== 'JOIN_REQUEST_ACCEPTED' && notificationType !== 'JOIN_REQUEST_REJECTED') {
        return;
      }

      const status: EventJoinStatus = notificationType === 'JOIN_REQUEST_ACCEPTED'
        ? 'accepted'
        : 'rejected';

      patchState(store, (state) => ({
        statuses: {
          ...state.statuses,
          [eventId]: status,
        },
        handledNotificationIds: notificationId
          ? {
              ...state.handledNotificationIds,
              [notificationId]: true,
            }
          : state.handledNotificationIds,
      }));
    },
  })),
  withHooks((store) => {
    let notificationsSubscription: Subscription | undefined;

    return {
      onInit() {
        const socketService = inject(SocketService);
        notificationsSubscription = socketService.notifications$.subscribe((notifications) => {
          if (!Array.isArray(notifications)) return;

          notifications.forEach((notification) => store.applyNotification(notification));
        });
      },

      onDestroy() {
        notificationsSubscription?.unsubscribe();
      },
    };
  })
);

function getStatusForEvent(
  statuses: Record<string, EventJoinStatus>,
  eventId: string
): EventJoinStatus {
  if (!eventId) return 'none';
  return statuses[eventId] ?? 'none';
}

function getLabelForStatus(status: EventJoinStatus): EventJoinButtonLabel {
  switch (status) {
    case 'pending':
      return 'Requested';
    case 'accepted':
      return 'Joined';
    default:
      return 'Request Join';
  }
}

function normalizeStatus(status: string | null | undefined): EventJoinStatus {
  const normalized = String(status || '').toLowerCase();

  if (
    normalized === 'pending' ||
    normalized === 'accepted' ||
    normalized === 'rejected'
  ) {
    return normalized;
  }

  return 'none';
}

function getNotificationId(notification: any): string {
  return notification?._id || notification?.id || '';
}

function getNotificationEventId(notification: any): string {
  return notification?.eventId?._id || notification?.eventId || '';
}
