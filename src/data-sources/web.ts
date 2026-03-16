/**
 * Web context — fetches current weather for Newport Beach via wttr.in.
 * No API key required. Additional news/sports context is provided by
 * Claude's built-in web search tool (enabled in briefing/claude.ts).
 */
import axios from 'axios';
import type { WebContext, WeatherData } from '../types/index';

interface WttrCondition {
  weatherDesc: Array<{ value: string }>;
  temp_F: string;
  temp_C: string;
  humidity: string;
  FeelsLikeF: string;
}

export async function fetchWeb(): Promise<WebContext> {
  try {
    const { data } = await axios.get('https://wttr.in/Newport+Beach,CA', {
      params: { format: 'j1' },
      timeout: 8_000,
      headers: { 'User-Agent': 'personal-os/1.0' },
    });

    const current: WttrCondition | undefined = data.current_condition?.[0];
    if (!current) {
      return { fetchedAt: new Date().toISOString() };
    }

    const weather: WeatherData = {
      location: 'Newport Beach, CA',
      condition: current.weatherDesc?.[0]?.value ?? 'Unknown',
      tempF: parseInt(current.temp_F, 10),
      tempC: parseInt(current.temp_C, 10),
      humidity: parseInt(current.humidity, 10),
      feelsLikeF: parseInt(current.FeelsLikeF, 10),
    };

    return { weather, fetchedAt: new Date().toISOString() };
  } catch {
    // Weather is non-critical — return empty on any failure
    return { fetchedAt: new Date().toISOString() };
  }
}
