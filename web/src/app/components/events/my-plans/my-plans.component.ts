import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs/operators';
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

  readonly plans = signal<any[]>([]);
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

  openPlan(plan: any): void {
    const eventId = plan?.eventId;
    if (eventId) {
      this.routeService.navigate('/events', eventId);
    }
  }

  signIn(): void {
    this.routeService.navigateByUrl('/login');
  }

  trackPlan(_index: number, plan: any): string {
    return String(plan?.ticketId || _index);
  }

  private loadPlans(): void {
    const userId = this.authService.userDetails?.id || this.authService.userDetails?._id;
    this.isSignedIn.set(Boolean(userId));

    if (!userId) {
      this.isLoading.set(false);
      return;
    }

    this.sharedService.getUserTickets()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          const payload = response?.data?.data ?? response?.data ?? response;
          const data = Array.isArray(payload)
            ? payload
            : payload && typeof payload === 'object'
              ? Object.values(payload)
              : [];

          const plans = data
            .map((ticket: any) => ticket?.ticket || ticket?.pass || ticket)
            .filter((ticket: any) => Boolean(ticket?.ticketId && ticket?.eventId))
            .filter((ticket: any) => !this.isEndedPlan(ticket))
            .sort((left: any, right: any) => this.comparePlans(left, right));

          this.plans.set(plans);
          this.isLoading.set(false);
        },
        error: () => {
          this.hasLoadError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  private comparePlans(left: any, right: any): number {
    const leftTime = this.eventTimestamp(left);
    const rightTime = this.eventTimestamp(right);
    return leftTime - rightTime;
  }

  private isEndedPlan(plan: any): boolean {
    const status = String(plan?.['status'] || plan?.['eventStatus'] || '').toLowerCase();
    if (status === 'completed' || status === 'ended') return true;
    return this.eventTimestamp(plan) < Date.now();
  }

  private eventTimestamp(plan: any): number {
    const rawDate = plan?.endDate || plan?.eventDate;
    if (!rawDate) return Number.MAX_SAFE_INTEGER;

    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) return Number.MAX_SAFE_INTEGER;

    const rawTime = String(plan?.endTime || (!plan?.endDate ? plan?.eventTime : '') || '').trim();
    if (!rawTime) {
      date.setHours(23, 59, 59, 999);
      return date.getTime();
    }

    const match = rawTime.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (match) {
      let hours = Number(match[1]);
      const minutes = Number(match[2] || 0);
      const modifier = match[3]?.toUpperCase();
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      date.setHours(hours, minutes, 0, 0);
    }

    return date.getTime();
  }
}
