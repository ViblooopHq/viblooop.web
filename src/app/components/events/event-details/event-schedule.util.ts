export function eventDurationLabel(startDate?: string, startTime?: string, endDate?: string, endTime?: string): string {
  if (!startDate || !startTime || !endDate || !endTime) return '';
  const start = new Date(`${startDate.slice(0, 10)}T${startTime}`);
  const end = new Date(`${endDate.slice(0, 10)}T${endTime}`);
  const minutes = Math.round((end.getTime() - start.getTime()) / 60_000);
  if (!Number.isFinite(minutes) || minutes <= 0) return '';
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return [hours ? `${hours}h` : '', remainder ? `${remainder}m` : ''].filter(Boolean).join(' ');
}

export function isPartyPlayHangout(category: unknown): boolean {
  const title = String((category as any)?.title || (category as any)?.name || category || '').toLowerCase();
  return ['party', 'social', 'meetup', 'play', 'sports', 'gaming', 'fitness', 'hangout'].some((name) => title.includes(name));
}
