/**
 * Date and time utilities for Turkey Timezone (Europe/Istanbul)
 */

export interface TurkeyTimeDetails {
  timeStr: string;
  hours: string;
  minutes: string;
  seconds: string;
  dateStr: string;
  dayNumber: string;
  monthName: string;
  year: string;
  dayName: string;
  fullDateTurkish: string;
  fullStr: string;
}

export function getTurkeyLiveDateTime(): TurkeyTimeDetails {
  const now = new Date();

  const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const fullDateFormatter = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const dayFormatter = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    day: 'numeric',
  });

  const monthFormatter = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    month: 'long',
  });

  const yearFormatter = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
  });

  const timeFormatter = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const hourFormatter = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    hour12: false,
  });

  const minuteFormatter = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    minute: '2-digit',
  });

  const secondFormatter = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    second: '2-digit',
  });

  const weekdayFormatter = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    weekday: 'long',
  });

  const dateStr = dateFormatter.format(now);
  const timeStr = timeFormatter.format(now);
  const weekday = weekdayFormatter.format(now);
  const fullDateTurkish = fullDateFormatter.format(now);

  return {
    timeStr,
    hours: hourFormatter.format(now),
    minutes: minuteFormatter.format(now),
    seconds: secondFormatter.format(now),
    dateStr,
    dayNumber: dayFormatter.format(now),
    monthName: monthFormatter.format(now),
    year: yearFormatter.format(now),
    dayName: weekday,
    fullDateTurkish: `${fullDateTurkish}, ${weekday}`,
    fullStr: `${dateStr} ${weekday} – ${timeStr}`,
  };
}

/**
 * Returns formatted timestamp in Turkish format: "24.09.2026 – 14:30"
 */
export function formatTurkeyTimestamp(date: Date | string = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const timeFormatter = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const datePart = dateFormatter.format(d);
  const timePart = timeFormatter.format(d);

  return `${datePart} – ${timePart}`;
}
