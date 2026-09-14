import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SocketService } from '../../shared/services/socket/socket.service';
import { AuthService } from '../../shared/services/auth/auth.service';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';

export interface ChatMessage {
  _id?: string;
  eventId: string;
  senderId: string;
  senderName: string;
  senderImage: string;
  text: string;
  createdAt: string;
}

@Component({
  selector: 'vl-chat',
  imports: [FormsModule, DatePipe, BackButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  eventId = input('');
  isEmbedded = input(false);
  chatTitle = input('Event Chat');
  chatSubtitle = input('');
  showBackButton = input(false);
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  closeChat = output<void>();
  backToInbox = output<void>();

  newMessage = signal('');
  messages = signal<ChatMessage[]>([]);
  currentUserId = '';

  private socketService = inject(SocketService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.currentUserId = this.authService.userDetails?.id || '';

    const historySub = this.socketService.chatHistory$.subscribe((history) => {
      if (history.eventId !== this.eventId()) return;

      this.messages.set(history.messages);
      this.scrollToBottom();
    });

    const messageSub = this.socketService.chatMessage$.subscribe((msg) => {
      if (msg && msg.eventId === this.eventId()) {
        this.messages.update((messages) => [...messages, msg]);
        this.scrollToBottom();
      }
    });

    this.destroyRef.onDestroy(() => {
      this.socketService.activeEventId = null;
      historySub.unsubscribe();
      messageSub.unsubscribe();
    });

    let previousEventId: string | null = null;
    effect(() => {
      const currentEventId = this.eventId();
      if (!currentEventId) return;

      const isRoomSwitch = previousEventId !== null && previousEventId !== currentEventId;
      previousEventId = currentEventId;

      if (isRoomSwitch) {
        // Clear messages list immediately for UX
        this.messages.set([]);
      }

      // We don't "leave" the old room anymore because we want
      // to keep receiving global message pings for unread badges.
      // We just join the new one to trigger a history load.
      this.socketService.activeEventId = currentEventId;
      this.socketService.joinChatRoom(currentEventId);

      if (isRoomSwitch) {
        this.socketService.markChatAsRead(currentEventId);
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage().trim()) return;
    this.socketService.sendChatMessage(this.eventId(), this.newMessage());
    this.newMessage.set('');
  }

  isOwnMessage(msg: ChatMessage): boolean {
    return msg.senderId === this.currentUserId;
  }

  getSenderInitial(msg: ChatMessage): string {
    return (msg.senderName || 'V').charAt(0).toUpperCase();
  }

  shouldShowSenderName(index: number, msg: ChatMessage): boolean {
    if (this.isOwnMessage(msg)) return false;

    const previousMessage = this.messages()[index - 1];
    return !previousMessage || previousMessage.senderId !== msg.senderId;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const el = this.messagesContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 50);
  }
}
