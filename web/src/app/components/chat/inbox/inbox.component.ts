import { Component, effect, HostListener, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SocketService } from '../../../shared/services/socket/socket.service';
import { ChatComponent } from '../chat.component';
import { Subscription } from 'rxjs';
import { SharedService } from '../../../shared/services/shared.service';
import { BrowserService } from '../../../shared/services/browser/browser.service';

@Component({
  selector: 'vl-inbox',
  standalone: true,
  imports: [CommonModule, DatePipe, ChatComponent],
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.scss'
})
export class InboxComponent implements OnInit, OnDestroy {
  socketService = inject(SocketService);
  sharedService = inject(SharedService);
  browserService = inject(BrowserService);

  conversations: any[] = [];
  selectedEventId: string | null = null;
  isMobileView = false;
  private subs: Subscription[] = [];
  private chatConversationsEffect = effect(() => {
    this.sharedService.chatConversationsRequest();
    if (this.isMobileView) {
      this.clearSelection();
    }
  });

  ngOnInit(): void {
    this.syncViewportMode();
    this.socketService.getInbox();
    
    this.subs.push(
      this.socketService.inbox$.subscribe(inbox => {
        this.conversations = inbox;

        if (!inbox.length) {
          this.selectedEventId = null;
          return;
        }

        const selectedStillExists = inbox.some((conv) => conv.eventId === this.selectedEventId);
        if (!this.isMobileView && (!this.selectedEventId || !selectedStillExists)) {
          this.selectConversation(inbox[0].eventId);
        } else if (this.isMobileView && this.selectedEventId && !selectedStillExists) {
          this.clearSelection();
        }
      })
    );
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    const wasMobileView = this.isMobileView;
    this.syncViewportMode();

    if (!wasMobileView && this.isMobileView) {
      this.clearSelection();
      return;
    }

    if (wasMobileView && !this.isMobileView && !this.selectedEventId && this.conversations.length > 0) {
      this.selectConversation(this.conversations[0].eventId);
    }
  }

  selectConversation(eventId: string): void {
    this.selectedEventId = eventId;
    this.socketService.markChatAsRead(eventId);
    
    // Locally clear count for better UX
    const conv = this.conversations.find(c => c.eventId === eventId);
    if (conv) conv.unreadCount = 0;
  }

  clearSelection(): void {
    this.selectedEventId = null;
    this.socketService.activeEventId = null;
  }

  get selectedConversation(): any | null {
    return this.conversations.find((conv) => conv.eventId === this.selectedEventId) || null;
  }

  getImageUrl(path: string): string {
    return path ? this.sharedService.getImageUrl(path) : 'assets/images/default-cover.jpg';
  }

  getMemberLabel(conv: any | null): string {
    if (!conv) return '';

    if (conv.memberCount) {
      return `${conv.memberCount} ${conv.memberCount === 1 ? 'member' : 'members'}`;
    }

    return 'Event group';
  }

  private syncViewportMode(): void {
    this.isMobileView = this.browserService.isBrowserPlatform()
      ? window.matchMedia('(max-width: 768px)').matches
      : false;
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
