/**
 * Returns true when the event falls on Saturday or Sunday in the same
 * Monday-to-Sunday calendar week as the reference date.
 */
export function isThisCalendarWeekend(eventDate: Date, referenceDate: Date = new Date()): boolean {
  if (Number.isNaN(eventDate.getTime()) || Number.isNaN(referenceDate.getTime())) return false;

  const eventDay = new Date(eventDate);
  eventDay.setHours(0, 0, 0, 0);

  const eventWeekday = eventDay.getDay();
  if (eventWeekday !== 0 && eventWeekday !== 6) return false;

  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const monday = new Date(today);
  const daysSinceMonday = (today.getDay() + 6) % 7;
  monday.setDate(today.getDate() - daysSinceMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return eventDay >= monday && eventDay <= sunday;
}
