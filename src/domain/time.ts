/** All business dates and times are computed in Africa/Lagos, never the device zone. */
export const BUSINESS_TZ = 'Africa/Lagos';

/** Today's date (YYYY-MM-DD) in Lagos, regardless of device timezone. */
export function businessDate(d: Date = new Date()): string {
  // en-CA gives ISO-style YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TZ }).format(d);
}

/** Current wall-clock time (HH:MM, 24h) in Lagos. */
export function businessTime(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: BUSINESS_TZ, hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(d);
}

/** Day of week (1=Mon … 7=Sun) for a YYYY-MM-DD string, in Lagos. */
export function weekday(dateStr: string): number {
  const d = new Date(`${dateStr}T12:00:00Z`);
  const wd = d.getUTCDay(); // 0=Sun..6=Sat — stable because we anchor at noon UTC
  return wd === 0 ? 7 : wd;
}

export function fmt12(t?: string | null): string {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function durationLabel(ci?: string | null, co?: string | null): string {
  if (!ci || !co) return '—';
  const [ih, im] = ci.split(':').map(Number);
  const [oh, om] = co.split(':').map(Number);
  const mins = oh * 60 + om - (ih * 60 + im);
  if (mins <= 0) return '—';
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}
