export const t = {
  bg: '#0b0d11',
  surface: '#12151c',
  surface2: '#191d27',
  accent: '#5b8dee',
  green: '#5bc4a0',
  warn: '#e0b86a',
  red: '#e07878',
  text: '#e8eaf0',
  muted: '#6b7280',
  border: 'rgba(255,255,255,0.06)',
  borderHover: 'rgba(255,255,255,0.10)',
  fh: "'Bebas Neue', sans-serif",
  fb: "'DM Sans', sans-serif",
  fm: "'DM Mono', monospace",
  r: 12,
} as const;

export type Color = (typeof t)[keyof typeof t];

/** Score → semantic color */
export function scoreColor(score: number | undefined): string {
  if (score === undefined) return t.muted;
  if (score >= 70) return t.green;
  if (score >= 50) return t.warn;
  return t.red;
}

/** Format minutes → "7h 24m" */
export function fmtMinutes(mins: number | undefined): string {
  if (!mins) return '—';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/** Format a local time string → "9:00 AM" */
export function fmtTime(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Los_Angeles',
  });
}

/** Format ISO date → "Mon Mar 16" */
export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Los_Angeles',
  });
}
