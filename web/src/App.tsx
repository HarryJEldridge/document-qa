import { useState, useEffect, useCallback } from 'react';
import { t, fmtDate } from './design/tokens';
import type { BriefingResponse, BriefingContext, DataSourceError } from './types';
import { BriefingCard } from './components/BriefingCard';
import { HealthPanel } from './components/HealthPanel';
import { CalendarPanel } from './components/CalendarPanel';
import { RemindersPanel } from './components/RemindersPanel';
import { MetricsPanel } from './components/MetricsPanel';

// ── Reusable Panel wrapper ────────────────────────────────────────────────────

function Panel({
  title,
  badge,
  children,
  defaultOpen = true,
}: {
  title: string;
  badge?: string | number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        background: t.surface,
        borderRadius: t.r,
        marginBottom: 8,
        border: `1px solid ${t.border}`,
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '13px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'inherit',
          textAlign: 'left',
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
          {title}
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {badge !== undefined && (
            <span
              style={{
                fontFamily: t.fm,
                fontSize: 12,
                color: t.muted,
              }}
            >
              {badge}
            </span>
          )}
          <span style={{ color: t.muted, fontSize: 11 }}>
            {open ? '▲' : '▼'}
          </span>
        </div>
      </button>
      {open && (
        <div style={{ padding: '0 16px 16px' }}>{children}</div>
      )}
    </div>
  );
}

// ── Source status chips ───────────────────────────────────────────────────────

function SourceChips({
  ctx,
}: {
  ctx: BriefingContext;
}) {
  const sources = [
    { name: 'Rem', data: ctx.reminders },
    { name: 'Cal', data: ctx.calendar },
    { name: 'Health', data: ctx.health },
    { name: 'CRM', data: ctx.hubspot },
    { name: 'Jira', data: ctx.jira },
    { name: 'Conf', data: ctx.confluence },
  ];

  const errMap = new Map<string, DataSourceError>(
    ctx.errors.map((e) => [e.source, e])
  );

  const nameMap: Record<string, string> = {
    Rem: 'Reminders',
    Cal: 'Calendar',
    CRM: 'HubSpot',
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: 5,
        flexWrap: 'wrap',
        padding: '6px 14px 10px',
      }}
    >
      {sources.map(({ name }) => {
        const key = nameMap[name] ?? name;
        const err = errMap.get(key);
        const source = sources.find((s) => s.name === name);
        const hasData = !!source?.data;
        const color = err?.skipped
          ? t.muted
          : err
          ? t.red
          : hasData
          ? t.green
          : t.muted;
        const bg = err?.skipped
          ? 'rgba(255,255,255,0.04)'
          : err
          ? 'rgba(224,120,120,0.10)'
          : hasData
          ? 'rgba(91,196,160,0.10)'
          : 'rgba(255,255,255,0.04)';

        return (
          <span
            key={name}
            style={{
              fontFamily: t.fm,
              fontSize: 10,
              color,
              background: bg,
              borderRadius: 100,
              padding: '2px 8px',
              letterSpacing: 0.3,
            }}
          >
            {name}
          </span>
        );
      })}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [data, setData] = useState<BriefingResponse | null>(null);
  const [ctx, setCtx] = useState<BriefingContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);

  const fetchLatest = useCallback(async () => {
    try {
      const res = await fetch('/api/briefings/latest');
      if (!res.ok) {
        if (res.status === 404) {
          setData(null);
          setCtx(null);
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const json: BriefingResponse = await res.json();
      setData(json);
      setCtx(JSON.parse(json.context_json) as BriefingContext);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchLatest().finally(() => setLoading(false));
  }, [fetchLatest]);

  // Poll while generating
  useEffect(() => {
    if (!generating) return;
    const prevId = data?.id;
    const interval = setInterval(async () => {
      const res = await fetch('/api/briefings/latest');
      if (!res.ok) return;
      const json: BriefingResponse = await res.json();
      if (json.id !== prevId) {
        setData(json);
        setCtx(JSON.parse(json.context_json) as BriefingContext);
        setGenerating(false);
      }
    }, 3000);
    // Stop polling after 3 minutes
    const timeout = setTimeout(() => setGenerating(false), 180_000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [generating, data?.id]);

  const handleRefresh = async () => {
    setSpinning(true);
    await fetchLatest();
    setTimeout(() => setSpinning(false), 600);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    await fetch('/api/briefings/generate', { method: 'POST' });
  };

  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Los_Angeles',
  });
  const timeLabel = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Los_Angeles',
  });

  const totalReminders = ctx?.reminders?.lists.reduce(
    (sum, l) => sum + l.items.length,
    0
  );
  const totalEvents = ctx?.calendar?.events.length ?? 0;
  const openJira = ctx?.jira?.assignedIssues.length ?? 0;

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: t.bg,
        paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* ── Sticky header ── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: t.bg,
          borderBottom: `1px solid ${t.border}`,
          paddingTop: 'calc(12px + env(safe-area-inset-top, 0px))',
          paddingBottom: 10,
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: t.fh,
              fontSize: 24,
              color: t.accent,
              letterSpacing: 2,
            }}
          >
            PERSONAL OS
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {!loading && !data && (
              <button
                onClick={handleGenerate}
                disabled={generating}
                style={{
                  background: generating
                    ? 'rgba(91,141,238,0.15)'
                    : t.accent,
                  color: generating ? t.accent : '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontFamily: t.fb,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: generating ? 'default' : 'pointer',
                }}
              >
                {generating ? 'Generating...' : 'Generate'}
              </button>
            )}
            <button
              onClick={handleRefresh}
              style={{
                background: 'none',
                border: 'none',
                color: t.muted,
                cursor: 'pointer',
                fontSize: 18,
                padding: '4px 6px',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                transform: spinning ? 'rotate(360deg)' : 'none',
                transition: spinning ? 'transform 0.6s ease' : 'none',
              }}
            >
              ↻
            </button>
          </div>
        </div>
        <div
          style={{
            fontFamily: t.fm,
            fontSize: 11,
            color: t.muted,
            marginTop: 2,
          }}
        >
          {dateLabel} · {timeLabel} PST
        </div>
      </header>

      {/* ── Loading ── */}
      {loading && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
            color: t.muted,
            fontFamily: t.fm,
            fontSize: 13,
          }}
        >
          Loading...
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div
          style={{
            margin: 16,
            padding: 14,
            background: 'rgba(224,120,120,0.10)',
            borderRadius: t.r,
            color: t.red,
            fontFamily: t.fm,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && !data && !generating && (
        <div
          style={{
            padding: '40px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: t.fh,
              fontSize: 48,
              color: t.accent,
              letterSpacing: 3,
              marginBottom: 12,
            }}
          >
            GOOD MORNING
          </div>
          <div
            style={{
              color: t.muted,
              fontSize: 14,
              marginBottom: 24,
              lineHeight: 1.6,
            }}
          >
            No briefing yet today.
            <br />
            Tap Generate or run{' '}
            <code
              style={{
                fontFamily: t.fm,
                fontSize: 12,
                background: t.surface2,
                padding: '1px 6px',
                borderRadius: 4,
              }}
            >
              npm run brief
            </code>{' '}
            on your Mac.
          </div>
          <button
            onClick={handleGenerate}
            style={{
              background: t.accent,
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '12px 28px',
              fontFamily: t.fb,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Generate Morning Briefing
          </button>
        </div>
      )}

      {/* ── Generating state ── */}
      {generating && (
        <div
          style={{
            padding: '24px',
            textAlign: 'center',
            color: t.accent,
            fontFamily: t.fm,
            fontSize: 13,
          }}
        >
          <div style={{ marginBottom: 8, fontSize: 24 }}>⟳</div>
          Gathering sources and generating briefing...
          <div style={{ color: t.muted, fontSize: 11, marginTop: 6 }}>
            This takes about 30–60 seconds
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      {!loading && data && ctx && (
        <div style={{ padding: '10px 12px 0' }}>
          {/* Source status */}
          <SourceChips ctx={ctx} />

          {/* Briefing text */}
          <BriefingCard
            text={data.output_text}
            weather={ctx.web?.weather}
            createdAt={data.created_at}
          />

          {/* Health */}
          {ctx.health && (
            <Panel
              title="HEALTH"
              badge={
                ctx.health.readiness.score !== undefined
                  ? `${ctx.health.readiness.score} ready`
                  : undefined
              }
            >
              <HealthPanel health={ctx.health} />
            </Panel>
          )}

          {/* Calendar */}
          <Panel title="TODAY" badge={totalEvents > 0 ? `${totalEvents} events` : undefined}>
            {ctx.calendar ? (
              <CalendarPanel calendar={ctx.calendar} />
            ) : (
              <div style={{ color: t.muted, fontFamily: t.fm, fontSize: 13, textAlign: 'center', padding: '12px 0' }}>
                Calendar not configured
              </div>
            )}
          </Panel>

          {/* Reminders */}
          <Panel
            title="REMINDERS"
            badge={
              totalReminders !== undefined && totalReminders > 0
                ? `${totalReminders} open`
                : undefined
            }
          >
            {ctx.reminders ? (
              <RemindersPanel reminders={ctx.reminders} />
            ) : (
              <div style={{ color: t.muted, fontFamily: t.fm, fontSize: 13, textAlign: 'center', padding: '12px 0' }}>
                Reminders not available (run on macOS)
              </div>
            )}
          </Panel>

          {/* Work: HubSpot + Jira */}
          <Panel
            title="WORK"
            badge={openJira > 0 ? `${openJira} open` : undefined}
            defaultOpen={false}
          >
            <MetricsPanel hubspot={ctx.hubspot} jira={ctx.jira} />
          </Panel>

          {/* Footer */}
          <div
            style={{
              textAlign: 'center',
              padding: '16px 0 8px',
              fontFamily: t.fm,
              fontSize: 10,
              color: t.muted,
            }}
          >
            {fmtDate(data.date)} · Personal OS v1.0
          </div>
        </div>
      )}
    </div>
  );
}
