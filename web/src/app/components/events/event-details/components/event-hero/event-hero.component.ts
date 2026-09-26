import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, effect, viewChild, input, output } from '@angular/core';
import { TimePipe } from '../../../../../shared/pipes/time.pipe';
import { DatePipe } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { ImageUrlPipe } from '../../../../../shared/pipes/image-url.pipe';
import { AttendeeProfile, EventDetails } from '../../../../../shared/interfaces/event.interface';
import { InlineLoaderComponent } from '../../../../../shared/components/inline-loader/inline-loader.component';

@Component({
  selector: 'vl-event-hero',
  imports: [MatTooltip, ImageUrlPipe, DatePipe, TimePipe, InlineLoaderComponent],
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
  eventDate = input<string | undefined>(undefined);
  timeLeftLabel = input('');
  locationLabel = input('');
  attendeePreviewProfiles = input<AttendeeProfile[]>([]);
  totalAttendeesCount = input(0);
  attendanceSummaryLabel = input('');
  joinRequestStatus = input('Request Join');
  canRequestJoin = input(true);
  eventPriceLabel = input('Free');
  pendingJoinRequestCount = input(0);

  readonly isMultiDay = computed(() => {
    const start = this.eventDate() || this.event()?.eventDate;
    const end = this.event()?.endDate;
    return !!start && !!end && new Date(start).toDateString() !== new Date(end).toDateString();
  });

  private readonly actionsDialog = viewChild<ElementRef<HTMLDialogElement>>('actionsDialog');

  constructor() {
    effect(() => {
      const dialog = this.actionsDialog()?.nativeElement;
      if (!dialog || typeof dialog.showModal !== 'function') return;
      if (this.isEventMenuOpen() && !dialog.open) dialog.showModal();
      if (!this.isEventMenuOpen() && dialog.open) dialog.close();
    });
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
