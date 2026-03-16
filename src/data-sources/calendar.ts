/**
 * Calendar — fetches from Google Calendar and Microsoft Outlook.
 * Both require OAuth2 refresh tokens stored in .env.
 * Sources that aren't configured return [] gracefully.
 *
 * Setup:
 *   Google: https://console.cloud.google.com → create OAuth2 credentials,
 *           enable Calendar API, run the auth flow to get GOOGLE_REFRESH_TOKEN
 *   Outlook: https://portal.azure.com → register app with Calendars.Read,
 *            run auth flow to get MICROSOFT_REFRESH_TOKEN
 */
import axios from 'axios';
import type { CalendarContext, CalendarEvent } from '../types/index';

// ── Helpers ───────────────────────────────────────────────────────────────────

function windowStart(): string {
  return new Date().toISOString();
}

function windowEnd(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

// ── Google Calendar ───────────────────────────────────────────────────────────

async function refreshGoogleToken(): Promise<string> {
  const { data } = await axios.post('https://oauth2.googleapis.com/token', {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    grant_type: 'refresh_token',
  });
  return data.access_token as string;
}

async function fetchGoogleEvents(): Promise<CalendarEvent[]> {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } =
    process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    return [];
  }

  const accessToken = await refreshGoogleToken();
  const { data } = await axios.get(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        timeMin: windowStart(),
        timeMax: windowEnd(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 20,
      },
    }
  );

  return (data.items ?? []).map((e: Record<string, unknown>): CalendarEvent => {
    const start = e.start as Record<string, string>;
    const end = e.end as Record<string, string>;
    const attendees =
      (e.attendees as Array<{ email: string }> | undefined) ?? [];
    return {
      id: e.id as string,
      title: (e.summary as string) ?? '(No title)',
      start: start.dateTime ?? start.date ?? '',
      end: end.dateTime ?? end.date ?? '',
      location: (e.location as string | undefined) ?? undefined,
      attendees: attendees.map((a) => a.email),
      isAllDay: !start.dateTime,
      description: (e.description as string | undefined) ?? undefined,
      source: 'google',
    };
  });
}

// ── Microsoft Outlook (Graph API) ─────────────────────────────────────────────

async function refreshMicrosoftToken(): Promise<string> {
  const {
    MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET,
    MICROSOFT_REFRESH_TOKEN,
    MICROSOFT_TENANT_ID,
  } = process.env;

  const tenant = MICROSOFT_TENANT_ID ?? 'common';
  const params = new URLSearchParams({
    client_id: MICROSOFT_CLIENT_ID!,
    client_secret: MICROSOFT_CLIENT_SECRET!,
    refresh_token: MICROSOFT_REFRESH_TOKEN!,
    grant_type: 'refresh_token',
    scope: 'https://graph.microsoft.com/Calendars.Read offline_access',
  });

  const { data } = await axios.post(
    `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
    params.toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return data.access_token as string;
}

async function fetchOutlookEvents(): Promise<CalendarEvent[]> {
  const {
    MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET,
    MICROSOFT_REFRESH_TOKEN,
  } = process.env;
  if (
    !MICROSOFT_CLIENT_ID ||
    !MICROSOFT_CLIENT_SECRET ||
    !MICROSOFT_REFRESH_TOKEN
  ) {
    return [];
  }

  const accessToken = await refreshMicrosoftToken();
  const { data } = await axios.get(
    'https://graph.microsoft.com/v1.0/me/calendarView',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Prefer: 'outlook.timezone="America/Los_Angeles"',
      },
      params: {
        startDateTime: windowStart(),
        endDateTime: windowEnd(),
        $orderby: 'start/dateTime',
        $top: 20,
        $select:
          'id,subject,start,end,location,attendees,isAllDay,bodyPreview',
      },
    }
  );

  return (data.value ?? []).map((e: Record<string, unknown>): CalendarEvent => {
    const start = e.start as Record<string, string>;
    const end = e.end as Record<string, string>;
    const location = e.location as Record<string, string> | undefined;
    const attendees =
      (
        e.attendees as Array<{
          emailAddress: { address: string };
        }>
      ) ?? [];
    return {
      id: (e.id as string) ?? '',
      title: (e.subject as string) ?? '(No title)',
      start: start.dateTime ?? '',
      end: end.dateTime ?? '',
      location: location?.displayName ?? undefined,
      attendees: attendees.map((a) => a.emailAddress.address),
      isAllDay: (e.isAllDay as boolean) ?? false,
      description: (e.bodyPreview as string | undefined) ?? undefined,
      source: 'outlook',
    };
  });
}

// ── Exported function ─────────────────────────────────────────────────────────

export async function fetchCalendar(): Promise<CalendarContext> {
  const [googleEvents, outlookEvents] = await Promise.all([
    fetchGoogleEvents().catch((): CalendarEvent[] => []),
    fetchOutlookEvents().catch((): CalendarEvent[] => []),
  ]);

  const events = [...googleEvents, ...outlookEvents].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  return { events, fetchedAt: new Date().toISOString() };
}
