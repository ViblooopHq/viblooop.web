import { Component, effect, EventEmitter, HostBinding, HostListener, inject, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SocketService } from '../../../shared/services/socket/socket.service';
import { ChatComponent } from '../chat.component';
import { Subscription } from 'rxjs';
import { SharedService } from '../../../shared/services/shared.service';
import { BrowserService } from '../../../shared/services/browser/browser.service';
import { AppDrawerService } from '../../../shared/services/drawer/app-drawer.service';
import { FormDrawerComponent } from '../../../shared/components/form-drawer/form-drawer.component';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';

@Component({
  selector: 'vl-inbox',
  standalone: true,
  imports: [CommonModule, DatePipe, ChatComponent, FormDrawerComponent, BackButtonComponent],
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.scss'
})
export class InboxComponent implements OnInit, OnDestroy {
  @Input() isDrawer = false;
  @Output() drawerClosed = new EventEmitter<void>();

  @HostBinding('class.is-drawer') get hostIsDrawer(): boolean {
    return this.isDrawer;
  }

  socketService = inject(SocketService);
  sharedService = inject(SharedService);
  browserService = inject(BrowserService);
  private appDrawerService = inject(AppDrawerService);

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

  closeDrawer(): void {
    this.appDrawerService.close();
    this.drawerClosed.emit();
  }

  get unreadTotalCount(): number {
    return this.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }

  ngOnInit(): void {
    this.syncViewportMode();
    this.socketService.getInbox();

    const drawerState = this.appDrawerService.currentDrawerState;
    if (drawerState?.type === 'chats' && drawerState.eventId) {
      this.selectedEventId = drawerState.eventId;
    }
    
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
