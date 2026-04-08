import Markdown from 'react-markdown';
import { t } from '../design/tokens';
import type { WeatherData } from '../types';

interface Props {
  text: string;
  weather?: WeatherData;
  createdAt: string;
}

export function BriefingCard({ text, weather, createdAt }: Props) {
  const age = Math.round(
    (Date.now() - new Date(createdAt).getTime()) / 60_000
  );
  const ageLabel =
    age < 60
      ? `${age}m ago`
      : `${Math.round(age / 60)}h ago`;

  return (
    <div
      style={{
        background: t.surface,
        borderRadius: t.r,
        padding: '16px',
        marginBottom: 8,
        border: `1px solid ${t.border}`,
      }}
    >
      {/* Meta row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
          paddingBottom: 12,
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <span
          style={{
            fontFamily: t.fh,
            fontSize: 16,
            color: t.accent,
            letterSpacing: 1.5,
          }}
        >
          BRIEFING
        </span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {weather && (
            <span
              style={{
                fontFamily: t.fm,
                fontSize: 12,
                color: t.muted,
              }}
            >
              {weather.tempF}°F · {weather.condition}
            </span>
          )}
          <span style={{ fontFamily: t.fm, fontSize: 11, color: t.muted }}>
            {ageLabel}
          </span>
        </div>
      </div>

      {/* Markdown content */}
      <div className="briefing-content" style={{ fontSize: 14, lineHeight: 1.7 }}>
        <Markdown>{text}</Markdown>
      </div>
    </div>
  );
}
