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
    this.socket = io(this.SERVER_URL);

    // Automatically re-register on connect or reconnect
    this.socket.on('connect', () => {
      const userId = this.userService.userDetails?.id;
      if (userId) {
        this.registerUser(userId);
      }
    });

    this.getNotifications();
    this.listenToChatEvents();
  }

  disconnect(): void {
    if (this.socket) this.socket.disconnect();
  }

  getNotifications() {
    this.socket.on('notifications', (notifications) => {
      this.notifications$.next(notifications);
      
      // Update the global notification count in SharedService (unread only)
      if (Array.isArray(notifications)) {
        const unreadCount = notifications.filter((n: any) => !n.read).length;
        this.sharedService.notificationCount.set(unreadCount);
      }
    });
  }

  markAllRead() {
    this.socket.emit('mark_all_read', this.userService.userDetails.id);
  }

  markNotificationAsRead(notificationId: string) {
    // Send as an array for backend consistency
    this.socket.emit('mark_as_read', this.userService.userDetails.id, [notificationId]);
  }

  registerUser(userId: string) {
    this.socket.emit('register', userId);
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
    const userId = this.userService.userDetails?.id;
    if (!userId || !eventId) return;
    this.socket.emit('chat:join', { eventId, userId });
  }

  leaveChatRoom(eventId: string): void {
    if (!eventId) return;
    this.socket.emit('chat:leave', { eventId });
  }

  markChatAsRead(eventId: string): void {
    const userId = this.userService.userDetails?.id;
    if (!userId || !eventId) return;
    this.socket.emit('chat:mark_read', { eventId, userId });
  }

  sendChatMessage(eventId: string, text: string): void {
    const user = this.userService.userDetails;
    if (!user || !eventId || !text?.trim()) return;

    this.socket.emit('chat:message', {
      eventId,
      senderId: user.id,
      senderName: user.username,
      senderImage: user.profileImage || '',
      text: text.trim(),
    });
  }

  getInbox(): void {
    const userId = this.userService.userDetails?.id;
    if (!userId) return;
    this.socket.emit('chat:get_inbox', userId);
  }
}
