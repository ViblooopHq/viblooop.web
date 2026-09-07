import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { ImageUrlPipe } from '../../../../../shared/pipes/image-url.pipe';
import { AttendeeProfile, EventDetails } from '../../../../../shared/interfaces/event.interface';
import { InlineLoaderComponent } from '../../../../../shared/components/inline-loader/inline-loader.component';
import { OutsideClickDirective } from '../../../../../directives/outside-click.directive';

@Component({
  selector: 'vl-event-hero',
  imports: [MatTooltip, ImageUrlPipe, DatePipe, InlineLoaderComponent, OutsideClickDirective],
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
}
