import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { EventDetails } from '../../../../shared/interfaces/event.interface';
import { ImageUrlPipe } from '../../../../shared/pipes/image-url.pipe';
import { TimePipe } from '../../../../shared/pipes/time.pipe';
import { ThemeService } from '../../../../shared/services/theme/theme.service';
import * as QRCode from 'qrcode';

@Component({
  selector: 'vl-ticket',
  standalone: true,
  imports: [DatePipe, ImageUrlPipe, TimePipe],
  templateUrl: './ticket.component.html',
  styleUrl: './ticket.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketComponent {
  readonly plan = input.required<EventDetails>();
  readonly selected = output<EventDetails>();
  readonly themeService = inject(ThemeService);
  readonly qrDataUrl = signal<string>('');

  constructor() {
    effect(() => {
      const code = this.ticketCode();
      const eventId = this.plan()._id || this.plan()['id'] || '';
      const payload = `https://viblooop.com/verify-ticket?code=${code}&event=${eventId}`;
      QRCode.toDataURL(payload, {
        margin: 1,
        width: 250,
        color: {
          dark: '#111827',
          light: '#ffffff',
        },
      })
        .then((url) => this.qrDataUrl.set(url))
        .catch(() => this.qrDataUrl.set(''));
    });
  }

  selectPlan(): void {
    this.selected.emit(this.plan());
  }

  categoryTitle(): string {
    const category = this.plan().category;
    if (typeof category === 'string') return category;
    return category?.title || category?.name || 'Hangout';
  }

  categoryIcon(): string {
    const category = this.categoryTitle().toLowerCase();
    if (category.includes('travel') || category.includes('escape') || category.includes('trip')) return 'flight';
    if (category.includes('play') || category.includes('sport') || category.includes('game')) return 'sports_esports';
    if (category.includes('hangout') || category.includes('coffee')) return 'local_cafe';
    return 'celebration';
  }

  eventImage(): string {
    const plan = this.plan();
    return plan.image || plan.gallery?.[0] || 'assets/images/default-cover.jpg';
  }

  venue(): string {
    const address = this.plan().address;
    if (!address) return 'Location shared with attendees';

    const area = (address.area || '').trim();
    const city = (address.city || '').trim();

    let parts: string[] = [];
    if (area && city) {
      if (area.toLowerCase() === city.toLowerCase()) {
        parts = [this.formatTitleCase(city)];
      } else {
        parts = [this.formatTitleCase(area), this.formatTitleCase(city)];
      }
    } else if (area) {
      parts = [this.formatTitleCase(area)];
    } else if (city) {
      parts = [this.formatTitleCase(city)];
    }

    if (parts.length > 0) {
      return parts.join(', ');
    }

    const fallback = address.partialAddress || address.fullAddress;
    return fallback ? this.cleanAddressString(fallback) : 'Location shared with attendees';
  }

  venueNote(): string {
    const address = this.plan().address;
    if (!address) return 'Open the plan for venue details';

    if (address.partialAddress) {
      const cleanedPartial = this.cleanAddressString(address.partialAddress);
      const mainVenue = this.venue();
      if (cleanedPartial.toLowerCase() === mainVenue.toLowerCase()) {
        return 'Exact address shared after confirmation';
      }
      return cleanedPartial;
    }

    if (address.area || address.city) {
      const stateCountry = [address.state, address.country].filter(Boolean).map(s => this.formatTitleCase(s)).join(', ');
      if (stateCountry) return stateCountry;
      return 'Exact address shared after confirmation';
    }

    return 'Open the plan for venue details';
  }

  hostName(): string {
    const creator = this.plan().createdBy;
    const rawName = creator?.username
      || creator?.['userName']
      || creator?.['name']
      || 'Viblooop Host';
    return this.formatName(rawName);
  }

  private formatTitleCase(str: string): string {
    if (!str) return '';
    return str.split(' ').map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '').join(' ');
  }

  private cleanAddressString(str: string): string {
    if (!str) return '';
    const parts = str.split(',').map(p => p.trim()).filter(Boolean);
    const uniqueParts: string[] = [];
    const seen = new Set<string>();

    for (const part of parts) {
      const formatted = this.formatTitleCase(part);
      const key = formatted.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueParts.push(formatted);
      }
    }
    return uniqueParts.join(', ');
  }

  private formatName(name: string): string {
    if (!name) return '';
    const trimmed = name.trim();
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 2) {
      return trimmed
        .toLowerCase()
        .split(' ')
        .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
        .join(' ');
    }
    return trimmed;
  }

  accessLabel(): string {
    const plan = this.plan();
    const explicitLabel = plan['ticketType'] || plan['accessType'];
    if (explicitLabel) return String(explicitLabel);
    return this.isFree() ? 'General Access' : 'Paid Access';
  }

  ticketCode(): string {
    const plan = this.plan();
    const rawId = String(plan._id || plan['id'] || plan.title || 'PLAN')
      .replace(/[^a-z0-9]/gi, '')
      .toUpperCase();
    const date = plan.eventDate ? new Date(plan.eventDate) : null;
    const datePart = date && !Number.isNaN(date.getTime())
      ? `${String(date.getDate()).padStart(2, '0')}${date.toLocaleString('en', { month: 'short' }).toUpperCase()}`
      : 'PLAN';
    return `VBPT-${datePart}-${rawId.slice(-4).padStart(4, '0')}`;
  }

  statusLabel(): string {
    return this.isPast() ? 'Attended' : 'Confirmed';
  }

  statusIcon(): string {
    return this.isPast() ? 'verified' : 'check_circle';
  }

  priceLabel(): string {
    if (this.isFree()) {
      return 'Free';
    }
    const plan = this.plan();
    const priceNum = Number(plan.price);
    if (!isNaN(priceNum) && priceNum > 0) {
      const currency = plan['currency'] || '₹';
      return `${currency}${priceNum}`;
    }
    if (plan.cost && String(plan.cost).trim().toLowerCase() !== 'free') {
      const costStr = String(plan.cost).trim();
      if (/^[\$₹€£]/.test(costStr)) {
        return costStr;
      }
      return `₹${costStr}`;
    }
    return 'Free';
  }

  onImageError(event: Event, fallback: string): void {
    const image = event.target as HTMLImageElement | null;
    if (!image || image.src.endsWith(fallback)) return;
    image.src = fallback;
  }

  private isFree(): boolean {
    const plan = this.plan();
    const cost = String(plan.cost || '').trim().toLowerCase();
    const price = Number(plan.price);
    return cost === 'free' || price === 0 || (!plan.cost && (plan.price === undefined || plan.price === null || isNaN(price) || price === 0));
  }

  private isPast(): boolean {
    const timestamp = this.eventTimestamp();
    return Number.isFinite(timestamp) && timestamp < Date.now();
  }

  private eventTimestamp(): number {
    const plan = this.plan();
    const rawDate = plan.endDate || plan.eventDate;
    if (!rawDate) return Number.MAX_SAFE_INTEGER;

    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) return Number.MAX_SAFE_INTEGER;

    const rawTime = String(plan.endTime || plan.eventTime || '').trim();
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
