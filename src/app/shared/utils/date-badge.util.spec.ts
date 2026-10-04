import { isThisCalendarWeekend } from './date-badge.util';

describe('isThisCalendarWeekend', () => {
  const monday = new Date(2026, 8, 14, 12);

  it('matches Saturday and Sunday in the current calendar week', () => {
    expect(isThisCalendarWeekend(new Date(2026, 8, 19), monday)).toBeTrue();
    expect(isThisCalendarWeekend(new Date(2026, 8, 20), monday)).toBeTrue();
  });

  it('does not match a later weekend', () => {
    expect(isThisCalendarWeekend(new Date(2026, 8, 26), monday)).toBeFalse();
  });

  it('does not treat next Saturday as this weekend when today is Sunday', () => {
    const sunday = new Date(2026, 8, 20, 12);
    expect(isThisCalendarWeekend(new Date(2026, 8, 26), sunday)).toBeFalse();
  });

  it('does not match weekdays in the current week', () => {
    expect(isThisCalendarWeekend(new Date(2026, 8, 18), monday)).toBeFalse();
  });
});
