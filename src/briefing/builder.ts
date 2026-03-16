import { fetchReminders } from '../data-sources/reminders';
import { fetchCalendar } from '../data-sources/calendar';
import { fetchHealth } from '../data-sources/health';
import { fetchHubSpot } from '../data-sources/hubspot';
import { fetchJira } from '../data-sources/jira';
import { fetchConfluence } from '../data-sources/confluence';
import { fetchWeb } from '../data-sources/web';
import type {
  BriefingContext,
  DataSourceError,
  RemindersContext,
  CalendarContext,
  HealthContext,
  HubSpotContext,
  JiraContext,
  ConfluenceContext,
  WebContext,
} from '../types/index';

const OWNER: BriefingContext['owner'] = {
  name: 'Harry Eldridge',
  role: 'Director of Business Value Engineering, Phocas Software',
  location: 'Newport Beach, CA',
  directReports: [
    'Pete McFadden',
    'Denise McGettigan',
    'Neil Cooper',
    'Alix',
    'Nick',
    'Dave',
  ],
  leadership: {
    cro: 'Matthew Kantelis',
    ceo: 'Myles Glashier',
  },
  fitness: { heightCm: 188, weightKg: 90 },
  reading: [
    'Never Split the Difference',
    'The Culture Code',
    'Thinking Fast and Slow',
    'Principles',
    'Meditations',
    'Measure What Matters',
    'Crossing the Chasm',
  ],
};

interface FetchResult<T> {
  result: T | undefined;
  error: DataSourceError | undefined;
}

async function tryFetch<T>(
  name: string,
  fn: () => Promise<T>
): Promise<FetchResult<T>> {
  try {
    const result = await fn();
    return { result, error: undefined };
  } catch (err) {
    const message = (err as Error).message ?? String(err);
    // "not set" / "must be set" errors mean the source isn't configured
    const skipped =
      message.includes('not set') || message.includes('must be set');
    console.error(
      `  [${name}] ${skipped ? 'skipped (not configured)' : 'error'}: ${message}`
    );
    return { result: undefined, error: { source: name, message, skipped } };
  }
}

export async function buildBriefingContext(): Promise<BriefingContext> {
  const [
    remindersRes,
    calendarRes,
    healthRes,
    hubspotRes,
    jiraRes,
    confluenceRes,
    webRes,
  ] = await Promise.all([
    tryFetch<RemindersContext>('Reminders', fetchReminders),
    tryFetch<CalendarContext>('Calendar', fetchCalendar),
    tryFetch<HealthContext>('Health', fetchHealth),
    tryFetch<HubSpotContext>('HubSpot', fetchHubSpot),
    tryFetch<JiraContext>('Jira', fetchJira),
    tryFetch<ConfluenceContext>('Confluence', fetchConfluence),
    tryFetch<WebContext>('Web', fetchWeb),
  ]);

  const errors: DataSourceError[] = [
    remindersRes.error,
    calendarRes.error,
    healthRes.error,
    hubspotRes.error,
    jiraRes.error,
    confluenceRes.error,
    webRes.error,
  ].filter((e): e is DataSourceError => e !== undefined);

  return {
    date: new Date().toISOString(),
    owner: OWNER,
    reminders: remindersRes.result,
    calendar: calendarRes.result,
    health: healthRes.result,
    hubspot: hubspotRes.result,
    jira: jiraRes.result,
    confluence: confluenceRes.result,
    web: webRes.result,
    errors,
  };
}
