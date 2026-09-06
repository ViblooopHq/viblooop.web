import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { Environment } from '../../../../environment';
import { SharedService } from '../shared.service';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket!: Socket;
  private readonly SERVER_URL = Environment.serverUrl;
  notifications$ = new BehaviorSubject<any>(null);

  // Chat observables
  chatHistory$ = new Subject<{ eventId: string; messages: any[] }>();
  chatMessage$ = new Subject<any>();
  chatError$ = new Subject<string>();
  inbox$ = new BehaviorSubject<any[]>([]);
  unreadCount$ = new BehaviorSubject<number>(0);
  activeEventId: string | null = null;

  constructor(
    private userService: AuthService,
    private sharedService: SharedService
  ) {
  }

  connect(): void {
    if (this.socket?.connected || this.socket?.active) return;

    this.socket = io(this.SERVER_URL, { withCredentials: true });

    // Automatically re-register on connect or reconnect
    this.socket.on('connect', () => {
      const userId = this.userService.userDetails?.id;
      if (userId) {
        this.registerUser();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection failed:', error.message);
    });

    this.getNotifications();
    this.listenToChatEvents();
  }

  disconnect(): void {
    if (this.socket) this.socket.disconnect();
    this.inbox$.next([]);
    this.unreadCount$.next(0);
    this.sharedService.notificationCount.set(0);
  }

  getNotifications() {
    this.socket.on('notifications', (notifications) => {
      this.notifications$.next(notifications);
    });

    this.socket.on('notifications:unread_total', (total: number) => {
      this.sharedService.notificationCount.set(Number.isFinite(total) ? total : 0);
    });
  }

  markAllRead() {
    this.socket.emit('mark_all_read');
  }

  markNotificationAsRead(notificationId: string) {
    // Send as an array for backend consistency
    this.socket.emit('mark_as_read', [notificationId]);
  }

  markNotificationsAsRead(notificationIds: string[]) {
    if (!notificationIds.length) return;
    this.socket.emit('mark_as_read', notificationIds);
  }

  registerUser() {
    this.socket.emit('register');
  }

  // ─── Chat Methods ─────────────────────────────────────

  private listenToChatEvents(): void {
    this.socket.on('chat:history', (payload: any) => {
      if (Array.isArray(payload)) {
        this.chatHistory$.next({
          eventId: this.activeEventId || '',
          messages: payload,
        });
        return;
      }

      this.chatHistory$.next({
        eventId: payload?.eventId || this.activeEventId || '',
        messages: Array.isArray(payload?.messages) ? payload.messages : [],
      });
    });

    this.socket.on('chat:message', (message: any) => {
      this.chatMessage$.next(message);
      
      // Update inbox list in real-time if a message arrives
      const currentInbox = this.inbox$.value;
      const conversation = currentInbox.find(c => c.eventId === message.eventId);

      const isNotActive = message.eventId !== this.activeEventId;
      const isNotOwn = message.senderId !== this.userService.userDetails?.id;
      
      if (conversation) {
        conversation.lastMessage = message;

        // Increment unread count if it's not the active chat and not our own message
        if (isNotActive && isNotOwn) {
          conversation.unreadCount = (conversation.unreadCount || 0) + 1;
          this.unreadCount$.next(this.unreadCount$.value + 1);
        } else if (!isNotActive && isNotOwn) {
          // If we are looking at the chat, mark it read on the backend too
          this.markChatAsRead(message.eventId);
        }

        // Move to top
        const updatedInbox = [
          conversation,
          ...currentInbox.filter(c => c.eventId !== message.eventId)
        ];
        this.inbox$.next(updatedInbox);
      } else {
        // If it's a new conversation we don't have yet, refresh the whole inbox
        this.getInbox();
      }
    });

    this.socket.on('chat:inbox', (inbox: any[]) => {
      this.inbox$.next(inbox);
    });

    this.socket.on('chat:unread_total', (total: number) => {
      this.unreadCount$.next(total);
    });

    this.socket.on('chat:error', (error: string) => {
      this.chatError$.next(error);
    });
  }

  joinChatRoom(eventId: string): void {
    if (!eventId) return;
    this.socket.emit('chat:join', { eventId });
  }

  leaveChatRoom(eventId: string): void {
    if (!eventId) return;
    this.socket.emit('chat:leave', { eventId });
  }

  markChatAsRead(eventId: string): void {
    if (!eventId) return;
    this.socket.emit('chat:mark_read', { eventId });
  }

  sendChatMessage(eventId: string, text: string): void {
    const user = this.userService.userDetails;
    if (!user || !eventId || !text?.trim()) return;

    this.socket.emit('chat:message', {
      eventId,
      text: text.trim(),
    });
  }

  getInbox(): void {
    if (!this.userService.userDetails?.id) return;
    this.socket.emit('chat:get_inbox');
  }
}
