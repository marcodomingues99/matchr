/** Portuguese month abbreviation → 0-based month index */
export const MONTHS: Record<string, number> = {
  Jan: 0, Fev: 1, Mar: 2, Abr: 3, Mai: 4, Jun: 5,
  Jul: 6, Ago: 7, Set: 8, Out: 9, Nov: 10, Dez: 11,
};

/** Portuguese month abbreviations ordered 0–11 (inverse of MONTHS, for date formatting) */
export const PT_MONTHS = Object.keys(MONTHS);

/** Parse a Portuguese date string "5 Abr 2026" → Date, or null on failure */
export const parseDatePt = (s: string): Date | null => {
  const parts = s.trim().split(/\s+/);
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0]);
  const month = MONTHS[parts[1]];
  const year = parseInt(parts[2]);
  if (isNaN(day) || month === undefined || isNaN(year) || day < 1) return null;

  const parsed = new Date(year, month, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};

/** Format ISO local datetime as "14 Mar 2026" */
export const formatDatePt = (iso: string): string => {
  const d = new Date(iso);
  return `${d.getDate()} ${PT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

/** Format ISO local datetime as "14 Mar" (no year) */
export const formatDateShortPt = (iso: string): string => {
  const d = new Date(iso);
  return `${d.getDate()} ${PT_MONTHS[d.getMonth()]}`;
};

/** Format ISO local datetime as "10:00" */
export const formatTimePt = (iso: string): string => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/** Format a Date object as "14 Mar 2026" (for DateTimePicker display) */
export const formatDateInputPt = (d: Date): string =>
  `${d.getDate()} ${PT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;

/** Number of days between two ISO dates (inclusive) */
export const daysBetween = (startIso: string, endIso: string): number => {
  const start = new Date(startIso);
  const end = new Date(endIso);
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);
};

/** Countdown from now to an ISO date target */
export const getCountdown = (targetIso: string) => {
  const target = new Date(targetIso);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
  };
};

/** All dates between start and end as ISO date strings (for day picker) */
export const getDateRange = (startIso: string, endIso: string): string[] => {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const days: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    days.push(`${y}-${m}-${d}T00:00:00`);
    cur.setDate(cur.getDate() + 1);
  }
  return days;
};

/** Convert Date to ISO local datetime string (no Z suffix) */
export const toLocalISO = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${day}T${h}:${min}:${s}`;
};
