/**
 * Health — Oura Ring API v2.
 * Fetches sleep, readiness, and activity data for today/yesterday.
 * Requires: OURA_API_KEY (https://cloud.ouraring.com/personal-access-tokens)
 */
import axios from 'axios';
import { format, subDays } from 'date-fns';
import type {
  HealthContext,
  SleepData,
  ReadinessData,
  ActivityData,
} from '../types/index';

const BASE = 'https://api.ouraring.com/v2/usercollection';

function today(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

function yesterday(): string {
  return format(subDays(new Date(), 1), 'yyyy-MM-dd');
}

function authHeader(): Record<string, string> {
  return { Authorization: `Bearer ${process.env.OURA_API_KEY}` };
}

// Oura API returns data for a date range; grab the most recent entry
function latest<T>(items: T[] | undefined): T | undefined {
  return items?.[items.length - 1];
}

async function fetchSleep(): Promise<SleepData> {
  const { data } = await axios.get(`${BASE}/daily_sleep`, {
    headers: authHeader(),
    params: { start_date: yesterday(), end_date: today() },
    timeout: 10_000,
  });

  const entry = latest(data.data);
  if (!entry) return {};

  const c = (entry as Record<string, unknown>).contributors as
    | Record<string, number>
    | undefined;

  return {
    score: (entry as Record<string, unknown>).score as number | undefined,
    totalSleepMinutes: c?.total_sleep
      ? Math.round(c.total_sleep / 60)
      : undefined,
    efficiency: c?.efficiency,
    lowestHR: c?.resting_heart_rate,
    averageHRV: c?.hrv_balance,
  };
}

async function fetchReadiness(): Promise<ReadinessData> {
  const { data } = await axios.get(`${BASE}/daily_readiness`, {
    headers: authHeader(),
    params: { start_date: yesterday(), end_date: today() },
    timeout: 10_000,
  });

  const entry = latest(data.data) as Record<string, unknown> | undefined;
  if (!entry) return {};

  const c = entry.contributors as Record<string, number> | undefined;

  return {
    score: entry.score as number | undefined,
    hrv: c?.hrv_balance,
    restingHR: c?.resting_heart_rate,
    temperatureDeviation: c?.body_temperature,
    recoveryIndex: c?.recovery_index,
  };
}

async function fetchActivity(): Promise<ActivityData> {
  const { data } = await axios.get(`${BASE}/daily_activity`, {
    headers: authHeader(),
    params: { start_date: yesterday(), end_date: today() },
    timeout: 10_000,
  });

  const entry = latest(data.data) as Record<string, unknown> | undefined;
  if (!entry) return {};

  return {
    score: entry.score as number | undefined,
    steps: entry.steps as number | undefined,
    totalCalories: entry.total_calories as number | undefined,
    activeCalories: entry.active_calories as number | undefined,
    meetDailyTargets: (
      entry.contributors as Record<string, number> | undefined
    )?.meet_daily_targets,
  };
}

export async function fetchHealth(): Promise<HealthContext> {
  if (!process.env.OURA_API_KEY) {
    throw new Error('OURA_API_KEY not set');
  }

  const [sleep, readiness, activity] = await Promise.all([
    fetchSleep().catch((): SleepData => ({})),
    fetchReadiness().catch((): ReadinessData => ({})),
    fetchActivity().catch((): ActivityData => ({})),
  ]);

  return {
    date: today(),
    sleep,
    readiness,
    activity,
    fetchedAt: new Date().toISOString(),
  };
}
