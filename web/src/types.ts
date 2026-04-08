// Mirror of backend src/types/index.ts — keep in sync

export interface ReminderItem {
  title: string;
  dueDate?: string;
  priority: number;
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

export interface SleepData {
  score?: number;
  totalSleepMinutes?: number;
  efficiency?: number;
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
}

export interface HealthContext {
  date: string;
  sleep: SleepData;
  readiness: ReadinessData;
  activity: ActivityData;
  fetchedAt: string;
}

export interface HubSpotDeal {
  id: string;
  name: string;
  stage: string;
  amount?: number;
  closeDate?: string;
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

export interface JiraIssue {
  key: string;
  summary: string;
  status: string;
  priority: string;
  project: string;
  updated: string;
  dueDate?: string;
  labels?: string[];
}

export interface JiraContext {
  assignedIssues: JiraIssue[];
  fetchedAt: string;
}

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

export interface WeatherData {
  location: string;
  condition: string;
  tempF: number;
  feelsLikeF: number;
  humidity: number;
}

export interface WebContext {
  weather?: WeatherData;
  fetchedAt: string;
}

export interface DataSourceError {
  source: string;
  message: string;
  skipped: boolean;
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

export interface BriefingResponse {
  id: number;
  date: string;
  output_text: string;
  context_json: string;
  created_at: string;
}
