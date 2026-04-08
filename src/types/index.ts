// ── Reminders ─────────────────────────────────────────────────────────────────

export interface ReminderItem {
  title: string;
  dueDate?: string;
  priority: number; // 0=none, 1=low, 5=medium, 9=high
  notes?: string;
}

export interface ReminderList {
  id: string;
  name: string;
  items: ReminderItem[];
}

export interface RemindersContext {
  lists: ReminderList[];
  fetchedAt: string;
}

// ── Calendar ──────────────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  attendees?: string[];
  isAllDay: boolean;
  description?: string;
  source: 'google' | 'outlook';
}

export interface CalendarContext {
  events: CalendarEvent[];
  fetchedAt: string;
}

// ── Health ────────────────────────────────────────────────────────────────────

export interface SleepData {
  score?: number;
  totalSleepMinutes?: number;
  remSleepMinutes?: number;
  deepSleepMinutes?: number;
  efficiency?: number;
  latencyMinutes?: number;
  lowestHR?: number;
  averageHRV?: number;
}

export interface ReadinessData {
  score?: number;
  hrv?: number;
  restingHR?: number;
  temperatureDeviation?: number;
  recoveryIndex?: number;
}

export interface ActivityData {
  score?: number;
  steps?: number;
  totalCalories?: number;
  activeCalories?: number;
  meetDailyTargets?: number;
}

export interface HealthContext {
  date: string;
  sleep: SleepData;
  readiness: ReadinessData;
  activity: ActivityData;
  fetchedAt: string;
}

// ── HubSpot ───────────────────────────────────────────────────────────────────

export interface HubSpotDeal {
  id: string;
  name: string;
  stage: string;
  amount?: number;
  closeDate?: string;
  company?: string;
  lastActivity?: string;
}

export interface HubSpotTask {
  id: string;
  title: string;
  status: string;
  dueDate?: string;
  type: string;
}

export interface HubSpotContext {
  deals: HubSpotDeal[];
  tasks: HubSpotTask[];
  fetchedAt: string;
}

// ── Jira ──────────────────────────────────────────────────────────────────────

export interface JiraIssue {
  key: string;
  summary: string;
  status: string;
  priority: string;
  project: string;
  updated: string;
  dueDate?: string;
  assignee?: string;
  labels?: string[];
}

export interface JiraContext {
  assignedIssues: JiraIssue[];
  fetchedAt: string;
}

// ── Confluence ────────────────────────────────────────────────────────────────

export interface ConfluencePage {
  id: string;
  title: string;
  space: string;
  lastModified: string;
  author: string;
  url: string;
}

export interface ConfluenceContext {
  recentPages: ConfluencePage[];
  fetchedAt: string;
}

// ── Web ───────────────────────────────────────────────────────────────────────

export interface WeatherData {
  location: string;
  condition: string;
  tempF: number;
  tempC: number;
  humidity: number;
  feelsLikeF: number;
}

export interface WebContext {
  weather?: WeatherData;
  fetchedAt: string;
}

// ── Briefing ──────────────────────────────────────────────────────────────────

export interface DataSourceError {
  source: string;
  message: string;
  skipped: boolean; // true = not configured, false = runtime error
}

export interface BriefingContext {
  date: string;
  owner: {
    name: string;
    role: string;
    location: string;
    directReports: string[];
    leadership: { cro: string; ceo: string };
    fitness: { heightCm: number; weightKg: number };
    reading: string[];
  };
  reminders?: RemindersContext;
  calendar?: CalendarContext;
  health?: HealthContext;
  hubspot?: HubSpotContext;
  jira?: JiraContext;
  confluence?: ConfluenceContext;
  web?: WebContext;
  errors: DataSourceError[];
}

// ── CRM ───────────────────────────────────────────────────────────────────────

export interface Contact {
  id?: number;
  name: string;
  role?: string;
  company?: string;
  email?: string;
  phone?: string;
  relationship?: string;
  notes?: string;
  lastContacted?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ── DB ────────────────────────────────────────────────────────────────────────

export interface StoredBriefing {
  id: number;
  date: string;
  context_json: string;
  output_text: string;
  created_at: string;
}
