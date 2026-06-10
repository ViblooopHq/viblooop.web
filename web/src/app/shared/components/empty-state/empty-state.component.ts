import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'vl-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
  @Input() subject = 'events';
  @Input() context = 'near you';
  @Input() contextPrefix = 'for';
  @Input() description = 'Looks like no one has created this vibe nearby. Be the first to plan something people can join.';
  @Input() createRoute = '/create-event';

  @Output() exploreAll = new EventEmitter<void>();

  get normalizedSubject(): string {
    return this.subject.trim() || 'events';
  }

  get titleSubject(): string {
    const subject = this.normalizedSubject;
    return subject.charAt(0).toUpperCase() + subject.slice(1);
  }

  get normalizedContext(): string {
    return this.context.trim();
  }

  get titleContext(): string {
    return this.normalizedContext;
  }

  get planSubject(): string {
    const subject = this.normalizedSubject;
    if (subject.toLowerCase() === 'events') return 'Event';
    return subject.charAt(0).toUpperCase() + subject.slice(1);
  }
}
