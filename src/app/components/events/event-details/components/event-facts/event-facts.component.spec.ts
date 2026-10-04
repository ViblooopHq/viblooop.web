import { TestBed } from '@angular/core/testing';
import { EventFactsComponent } from './event-facts.component';

describe('EventFactsComponent schedule', () => {
  it('shows one date and the time range for same-day events, including trips', () => {
    const fixture = TestBed.createComponent(EventFactsComponent);
    fixture.componentRef.setInput('eventDate', '2026-09-26');
    fixture.componentRef.setInput('endDate', '2026-09-26');
    fixture.componentRef.setInput('eventTime', '15:00');
    fixture.componentRef.setInput('endTime', '20:00');
    fixture.componentRef.setInput('isEscapeEvent', true);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.info-row');
    expect(rows[0].textContent).toContain('Saturday, 26 September 2026');
    expect(rows[1].textContent).toContain('3:00 PM – 8:00 PM');
  });

  it('shows both dates with their times and calendar icons for multi-day events', () => {
    const fixture = TestBed.createComponent(EventFactsComponent);
    fixture.componentRef.setInput('eventDate', '2026-09-26');
    fixture.componentRef.setInput('endDate', '2026-09-28');
    fixture.componentRef.setInput('eventTime', '15:00');
    fixture.componentRef.setInput('endTime', '20:00');
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.info-row');
    expect(rows[0].textContent).toContain('3:00 PM');
    expect(rows[1].textContent).toContain('Monday, 28 September 2026');
    expect(rows[1].textContent).toContain('8:00 PM');
    expect(rows[0].querySelector('.material-symbols-outlined').textContent).toBe('calendar_today');
    expect(rows[1].querySelector('.material-symbols-outlined').textContent).toBe('event');
  });
});
