import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, effect, viewChild, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { TimePipe } from '../../../../../shared/pipes/time.pipe';
import { EventDetails } from '../../../../../shared/interfaces/event.interface';
import { InlineLoaderComponent } from '../../../../../shared/components/inline-loader/inline-loader.component';

@Component({
  selector: 'vl-event-hero',
  imports: [MatTooltip, DatePipe, TimePipe, InlineLoaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-hero.component.html',
  styleUrl: './event-hero.component.scss',
})
export class EventHeroComponent {
  @ViewChild('heroCtaBtn', { read: ElementRef }) heroCtaBtn?: ElementRef<HTMLElement>;
  @ViewChild('heroActionContainer', { read: ElementRef }) heroActionContainer?: ElementRef<HTMLElement>;
  event = input<EventDetails | null>(null);
  isEventCreator = input(false);
  isEventMenuOpen = input(false);
  isEscapeEvent = input(false);
  isEventEnded = input(false);
  isUserAttendee = input(false);
  isCancelled = input(false);
  isLoggedIn = input(false);
  isAuthInitialized = input(false);
  isJoinRequestPending = input(false);
  totalAttendeesCount = input(0);
  joinRequestStatus = input('Request Join');
  canRequestJoin = input(true);
  eventPriceLabel = input('Free');
  pendingJoinRequestCount = input(0);

  private readonly actionsDialog = viewChild<ElementRef<HTMLDialogElement>>('actionsDialog');
  private readonly attendeeActionsDialog = viewChild<ElementRef<HTMLDialogElement>>('attendeeActionsDialog');
  readonly isAttendeeMenuOpen = signal(false);

  constructor() {
    effect(() => {
      const dialog = this.actionsDialog()?.nativeElement;
      if (dialog && typeof dialog.showModal === 'function') {
        if (this.isEventMenuOpen() && !dialog.open) dialog.showModal();
        if (!this.isEventMenuOpen() && dialog.open) dialog.close();
      }

      const attendeeDialog = this.attendeeActionsDialog()?.nativeElement;
      if (!attendeeDialog || typeof attendeeDialog.showModal !== 'function') return;
      if (this.isAttendeeMenuOpen() && !attendeeDialog.open) attendeeDialog.showModal();
      if (!this.isAttendeeMenuOpen() && attendeeDialog.open) attendeeDialog.close();
    });
  }

  toggleAttendeeMenu(): void {
    this.isAttendeeMenuOpen.update((open) => !open);
  }

  closeAttendeeMenu(): void {
    this.isAttendeeMenuOpen.set(false);
  }

  leaveFromAttendeeMenu(): void {
    this.closeAttendeeMenu();
    this.leaveEvent.emit();
  }

  onAttendeeSheetBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeAttendeeMenu();
  }

  onSheetBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeMenu.emit();
  }

  goBack = output<void>();
  toggleMenu = output<void>();
  editEvent = output<void>();
  closeMenu = output<void>();
  requestJoin = output<void>();
  openAttendees = output<void>();
  openRequests = output<void>();
  deleteEvent = output<void>();
  cancelEvent = output<void>();
  leaveEvent = output<void>();
  cancelJoinRequest = output<void>();
  shareEvent = output<void>();
}
