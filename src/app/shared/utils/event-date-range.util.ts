export function eventDateRangeDurationLabel(
  startValue: string | Date | null | undefined,
  endValue: string | Date | null | undefined,
): string {
  const start = toCalendarDay(startValue);
  const end = toCalendarDay(endValue);
  if (!start || !end || end < start) return '';

  const days = Math.round((end - start) / 86_400_000) + 1;
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

function toCalendarDay(value: string | Date | null | undefined): number | null {
  if (!value) return null;

  let year: number;
  let month: number;
  let day: number;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    year = value.getFullYear();
    month = value.getMonth() + 1;
    day = value.getDate();
  } else {
    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      year = Number(match[1]);
      month = Number(match[2]);
      day = Number(match[3]);
    } else {
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return null;
      year = parsed.getFullYear();
      month = parsed.getMonth() + 1;
      day = parsed.getDate();
    }
  }

  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return timestamp;
}
