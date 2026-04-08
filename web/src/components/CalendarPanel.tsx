import { t, fmtTime } from '../design/tokens';
import type { CalendarContext, CalendarEvent } from '../types';

interface Props {
  calendar: CalendarContext;
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isCurrent(event: CalendarEvent): boolean {
  const now = Date.now();
  return new Date(event.start).getTime() <= now && new Date(event.end).getTime() >= now;
}

function isPast(event: CalendarEvent): boolean {
  return new Date(event.end).getTime() < Date.now();
}

function SourceBadge({ source }: { source: 'google' | 'outlook' }) {
  return (
    <span
      style={{
        fontFamily: t.fm,
        fontSize: 9,
        color: t.muted,
        background: 'rgba(255,255,255,0.06)',
        borderRadius: 4,
        padding: '1px 5px',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}
    >
      {source === 'google' ? 'G' : 'OL'}
    </span>
  );
}

function EventRow({ event }: { event: CalendarEvent }) {
  const current = isCurrent(event);
  const past = isPast(event);

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: '10px 0',
        borderBottom: `1px solid ${t.border}`,
        opacity: past ? 0.45 : 1,
      }}
    >
      {/* Time column */}
      <div style={{ minWidth: 58, paddingTop: 1 }}>
        {event.isAllDay ? (
          <span style={{ fontFamily: t.fm, fontSize: 11, color: t.muted }}>
            All day
          </span>
        ) : (
          <>
            <div
              style={{
                fontFamily: t.fm,
                fontSize: 12,
                color: current ? t.accent : t.muted,
                fontWeight: current ? 500 : 400,
              }}
            >
              {fmtTime(event.start)}
            </div>
            <div style={{ fontFamily: t.fm, fontSize: 10, color: t.muted }}>
              {fmtTime(event.end)}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 2,
          }}
        >
          {current && (
            <span
              style={{
                display: 'inline-block',
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: t.accent,
                flexShrink: 0,
              }}
            />
          )}
          <span
            style={{
              fontSize: 14,
              fontWeight: current ? 600 : 400,
              color: current ? t.text : t.text,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {event.title}
          </span>
          <SourceBadge source={event.source} />
        </div>

        {event.location && (
          <div
            style={{ fontSize: 12, color: t.muted, marginBottom: 2 }}
          >
            📍 {event.location}
          </div>
        )}

        {event.attendees && event.attendees.length > 0 && (
          <div style={{ fontSize: 11, color: t.muted }}>
            {event.attendees.slice(0, 3).join(', ')}
            {event.attendees.length > 3 &&
              ` +${event.attendees.length - 3}`}
          </div>
        )}
      </div>
    </div>
  );
}

export function CalendarPanel({ calendar }: Props) {
  const todayEvents = calendar.events.filter(
    (e) => isToday(e.start) || isToday(e.end)
  );
  const tomorrowEvents = calendar.events.filter(
    (e) => !isToday(e.start) && !isToday(e.end)
  );

  if (calendar.events.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '20px 0',
          color: t.muted,
          fontFamily: t.fm,
          fontSize: 13,
        }}
      >
        No events
      </div>
    );
  }

  return (
    <div>
      {todayEvents.length > 0 && (
        <div>
          <div
            style={{
              fontFamily: t.fm,
              fontSize: 10,
              color: t.muted,
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            Today
          </div>
          {todayEvents.map((e) => (
            <EventRow key={e.id} event={e} />
          ))}
        </div>
      )}

      {tomorrowEvents.length > 0 && (
        <div style={{ marginTop: todayEvents.length > 0 ? 12 : 0 }}>
          <div
            style={{
              fontFamily: t.fm,
              fontSize: 10,
              color: t.muted,
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 4,
              marginTop: 4,
            }}
          >
            Tomorrow
          </div>
          {tomorrowEvents.map((e) => (
            <EventRow key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
