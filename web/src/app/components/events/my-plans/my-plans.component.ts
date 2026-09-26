import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs/operators';
import { EventDetails } from '../../../shared/interfaces/event.interface';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { RouteService } from '../../../shared/services/route/route.service';
import { SharedService } from '../../../shared/services/shared.service';
import { TicketComponent } from './ticket/ticket.component';

@Component({
  selector: 'vl-my-plans',
  standalone: true,
  imports: [TicketComponent],
  templateUrl: './my-plans.component.html',
  styleUrl: './my-plans.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyPlansComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly sharedService = inject(SharedService);
  private readonly routeService = inject(RouteService);
  private readonly destroyRef = inject(DestroyRef);

  readonly plans = signal<EventDetails[]>([]);
  readonly isLoading = signal(true);
  readonly hasLoadError = signal(false);
  readonly isSignedIn = signal(false);

  ngOnInit(): void {
    this.authService.isAuthInitialized$
      .pipe(
        filter(Boolean),
        take(1),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.loadPlans());
  }

  openPlan(plan: EventDetails): void {
    const eventId = plan?._id || plan?.['id'];
    if (eventId) {
      this.routeService.navigate('/events', eventId);
    }
  }

  signIn(): void {
    this.routeService.navigateByUrl('/login');
  }

  trackPlan(_index: number, plan: EventDetails): string {
    return String(plan?._id || plan?.['id'] || _index);
  }

  private loadPlans(): void {
    const userId = this.authService.userDetails?.id || this.authService.userDetails?._id;
    this.isSignedIn.set(Boolean(userId));

    if (!userId) {
      this.isLoading.set(false);
      return;
    }

    this.sharedService.getAttendedEvents(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          const data = Array.isArray(response)
            ? response
            : Array.isArray(response?.data)
              ? response.data
              : [];

          const plans = data
            .map((item: any) => this.unwrapEvent(item))
            .filter((item: EventDetails | null): item is EventDetails => Boolean(item?._id || item?.title))
            .filter((item: EventDetails) => !this.isEndedPlan(item))
            .sort((left: EventDetails, right: EventDetails) => this.comparePlans(left, right));

          this.plans.set(plans);
          this.isLoading.set(false);
        },
        error: () => {
          this.hasLoadError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  private unwrapEvent(item: any): EventDetails | null {
    if (!item) return null;
    if (item.event && typeof item.event === 'object') return item.event;
    if (item.eventId && typeof item.eventId === 'object') return item.eventId;
    return item;
  }

  private comparePlans(left: EventDetails, right: EventDetails): number {
    const leftTime = this.eventTimestamp(left);
    const rightTime = this.eventTimestamp(right);
    return leftTime - rightTime;
  }

  private isEndedPlan(plan: EventDetails): boolean {
    const status = String(plan?.['status'] || plan?.['eventStatus'] || '').toLowerCase();
    if (status === 'completed' || status === 'ended') return true;
    return this.eventTimestamp(plan) < Date.now();
  }

  private eventTimestamp(plan: EventDetails): number {
    const rawDate = plan?.endDate || plan?.eventDate;
    if (!rawDate) return Number.MAX_SAFE_INTEGER;

    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) return Number.MAX_SAFE_INTEGER;

    const rawTime = String(plan?.endTime || (!plan?.endDate ? plan?.eventTime : '') || '').trim();
    const match = rawTime.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (match) {
      let hours = Number(match[1]);
      const minutes = Number(match[2] || 0);
      const modifier = match[3]?.toUpperCase();
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      date.setHours(hours, minutes, 0, 0);
    } else {
      date.setHours(23, 59, 59, 999);
    }

    return date.getTime();
  }
}
