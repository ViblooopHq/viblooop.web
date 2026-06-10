import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { SocketService } from '../../shared/services/socket/socket.service';
import { AuthService } from '../../shared/services/auth/auth.service';

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
  standalone: true,
  selector: 'vl-chat',
  imports: [FormsModule, DatePipe],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, OnDestroy, OnChanges {
  @Input() eventId: string = '';
  @Input() isEmbedded: boolean = false;
  @Input() chatTitle: string = 'Event Chat';
  @Input() chatSubtitle: string = '';
  @Input() showBackButton: boolean = false;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @Output() closeChat: EventEmitter<void> = new EventEmitter<void>();
  @Output() backToInbox: EventEmitter<void> = new EventEmitter<void>();

  newMessage: string = '';
  messages: ChatMessage[] = [];
  currentUserId: string = '';

  private socketService = inject(SocketService);
  private authService = inject(AuthService);
  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.currentUserId = this.authService.userDetails?.id || '';

    // Subscribe to chat history (sent once on join)
    this.subs.push(
      this.socketService.chatHistory$.subscribe((history) => {
        if (history.eventId !== this.eventId) return;

        this.messages = history.messages;
        this.scrollToBottom();
      })
    );

    // Subscribe to new incoming messages
    this.subs.push(
      this.socketService.chatMessage$.subscribe((msg) => {
        if (msg && msg.eventId === this.eventId) {
          this.messages.push(msg);
          this.scrollToBottom();
        }
      })
    );

    // Join the initial chat room
    if (this.eventId) {
      this.socketService.activeEventId = this.eventId;
      this.socketService.joinChatRoom(this.eventId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const eventIdChange = changes['eventId'];
    if (eventIdChange && !eventIdChange.firstChange) {
      const currId = eventIdChange.currentValue;

      // Clear messages list immediately for UX
      this.messages = [];
      
      if (currId) {
        // We don't "leave" the old room anymore because we want 
        // to keep receiving global message pings for unread badges.
        // We just join the new one to trigger a history load.
        this.socketService.activeEventId = currId;
        this.socketService.joinChatRoom(currId);
        this.socketService.markChatAsRead(currId);
      }
    }
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;
    this.socketService.sendChatMessage(this.eventId, this.newMessage);
    this.newMessage = '';
  }

  isOwnMessage(msg: ChatMessage): boolean {
    return msg.senderId === this.currentUserId;
  }

  getSenderInitial(msg: ChatMessage): string {
    return (msg.senderName || 'V').charAt(0).toUpperCase();
  }

  shouldShowSenderName(index: number, msg: ChatMessage): boolean {
    if (this.isOwnMessage(msg)) return false;

    const previousMessage = this.messages[index - 1];
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

  ngOnDestroy(): void {
    // We stay in the rooms globally for the inbox functionality.
    this.socketService.activeEventId = null;
    this.subs.forEach((s) => s.unsubscribe());
  }
}
