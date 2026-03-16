import { t, scoreColor, fmtMinutes } from '../design/tokens';
import type { HealthContext } from '../types';

interface Props {
  health: HealthContext;
}

function ScoreBar({
  label,
  value,
  max = 100,
  unit = '',
  showBar = true,
}: {
  label: string;
  value: number | undefined;
  max?: number;
  unit?: string;
  showBar?: boolean;
}) {
  const color = scoreColor(max === 100 ? value : undefined);
  const pct = value !== undefined ? Math.min((value / max) * 100, 100) : 0;
  const display = value !== undefined ? `${value}${unit}` : '—';

  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: showBar ? 5 : 0,
        }}
      >
        <span
          style={{
            fontFamily: t.fm,
            fontSize: 11,
            color: t.muted,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: t.fm,
            fontSize: 16,
            color,
            fontWeight: 500,
          }}
        >
          {display}
        </span>
      </div>
      {showBar && (
        <div
          style={{
            height: 3,
            background: 'rgba(255,255,255,0.07)',
            borderRadius: 2,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: color,
              borderRadius: 2,
              transition: 'width 0.7s ease',
            }}
          />
        </div>
      )}
    </div>
  );
}

function BigScore({
  value,
  label,
}: {
  value: number | undefined;
  label: string;
}) {
  const color = scoreColor(value);
  return (
    <div
      style={{
        flex: 1,
        background: t.surface2,
        borderRadius: 10,
        padding: '14px 12px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: t.fm,
          fontSize: 36,
          fontWeight: 500,
          color,
          lineHeight: 1,
        }}
      >
        {value ?? '—'}
      </div>
      <div
        style={{
          fontFamily: t.fm,
          fontSize: 10,
          color: t.muted,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          marginTop: 4,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function HealthPanel({ health }: Props) {
  const { sleep, readiness, activity } = health;

  return (
    <div>
      {/* Big score row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <BigScore value={readiness.score} label="Readiness" />
        <BigScore value={sleep.score} label="Sleep" />
        <BigScore value={activity.score} label="Activity" />
      </div>

      {/* Detail bars */}
      <ScoreBar
        label="Sleep duration"
        value={sleep.totalSleepMinutes}
        max={600}
        unit={sleep.totalSleepMinutes ? '' : ''}
        showBar={false}
      />
      {sleep.totalSleepMinutes !== undefined && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <span
            style={{ fontFamily: t.fm, fontSize: 11, color: t.muted, textTransform: 'uppercase', letterSpacing: 0.8 }}
          >
            Duration
          </span>
          <span style={{ fontFamily: t.fm, fontSize: 14, color: t.text }}>
            {fmtMinutes(sleep.totalSleepMinutes)}
          </span>
        </div>
      )}
      <ScoreBar label="HRV" value={readiness.hrv} max={200} unit="ms" showBar={false} />
      <ScoreBar label="Resting HR" value={readiness.restingHR} max={100} unit="bpm" showBar={false} />
      <ScoreBar label="Sleep efficiency" value={sleep.efficiency} />
      {activity.steps !== undefined && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontFamily: t.fm, fontSize: 11, color: t.muted, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Steps
          </span>
          <span style={{ fontFamily: t.fm, fontSize: 14, color: t.text }}>
            {activity.steps.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
