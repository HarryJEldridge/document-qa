import { t } from '../design/tokens';
import type { HubSpotContext, JiraContext } from '../types';

interface Props {
  hubspot?: HubSpotContext;
  jira?: JiraContext;
}

const PRIORITY_COLOR: Record<string, string> = {
  Highest: '#e07878',
  High: '#e07878',
  Medium: '#e0b86a',
  Low: '#5bc4a0',
  Lowest: '#5bc4a0',
};

const STAGE_LABELS: Record<string, string> = {
  appointmentscheduled: 'Meeting',
  qualifiedtobuy: 'Qualified',
  presentationscheduled: 'Demo',
  decisionmakerboughtin: 'Decision',
  contractsent: 'Contract',
  closedwon: 'Won ✓',
  closedlost: 'Lost',
};

function stageLabel(stage: string): string {
  return STAGE_LABELS[stage.toLowerCase()] ?? stage;
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div
      style={{
        fontFamily: t.fm,
        fontSize: 10,
        color: t.muted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        marginTop: 4,
      }}
    >
      {label}
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        height: 1,
        background: t.border,
        margin: '14px 0',
      }}
    />
  );
}

export function MetricsPanel({ hubspot, jira }: Props) {
  const hasHubspot = hubspot && (hubspot.deals.length > 0 || hubspot.tasks.length > 0);
  const hasJira = jira && jira.assignedIssues.length > 0;

  if (!hasHubspot && !hasJira) {
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
        No work data — configure HubSpot and Jira in .env
      </div>
    );
  }

  return (
    <div>
      {/* HubSpot Deals */}
      {hubspot && hubspot.deals.length > 0 && (
        <div>
          <SectionLabel label={`HubSpot · ${hubspot.deals.length} deals`} />
          {hubspot.deals.slice(0, 5).map((deal) => (
            <div
              key={deal.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: `1px solid ${t.border}`,
                gap: 8,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: t.text,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {deal.name}
                </div>
                <div
                  style={{ fontFamily: t.fm, fontSize: 11, color: t.muted, marginTop: 1 }}
                >
                  {stageLabel(deal.stage)}
                  {deal.closeDate &&
                    ` · ${new Date(deal.closeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                </div>
              </div>
              {deal.amount !== undefined && (
                <span
                  style={{
                    fontFamily: t.fm,
                    fontSize: 12,
                    color: t.green,
                    whiteSpace: 'nowrap',
                  }}
                >
                  ${deal.amount >= 1000
                    ? `${(deal.amount / 1000).toFixed(0)}K`
                    : deal.amount.toFixed(0)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* HubSpot Tasks */}
      {hubspot && hubspot.tasks.length > 0 && (
        <div style={{ marginTop: hubspot.deals.length > 0 ? 12 : 0 }}>
          <SectionLabel label={`Tasks · ${hubspot.tasks.length} open`} />
          {hubspot.tasks.slice(0, 4).map((task) => (
            <div
              key={task.id}
              style={{
                padding: '7px 0',
                borderBottom: `1px solid ${t.border}`,
              }}
            >
              <div style={{ fontSize: 13, color: t.text }}>
                {task.title}
              </div>
              {task.dueDate && (
                <div style={{ fontFamily: t.fm, fontSize: 11, color: t.warn, marginTop: 1 }}>
                  Due{' '}
                  {new Date(task.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {hasHubspot && hasJira && <Divider />}

      {/* Jira Issues */}
      {jira && jira.assignedIssues.length > 0 && (
        <div>
          <SectionLabel
            label={`Jira · ${jira.assignedIssues.length} open`}
          />
          {jira.assignedIssues.slice(0, 6).map((issue) => (
            <div
              key={issue.key}
              style={{
                display: 'flex',
                gap: 10,
                padding: '8px 0',
                borderBottom: `1px solid ${t.border}`,
                alignItems: 'flex-start',
              }}
            >
              <span
                style={{
                  fontFamily: t.fm,
                  fontSize: 10,
                  color: PRIORITY_COLOR[issue.priority] ?? t.muted,
                  paddingTop: 3,
                  flexShrink: 0,
                }}
              >
                {issue.priority === 'Highest' || issue.priority === 'High'
                  ? '▲'
                  : issue.priority === 'Low' || issue.priority === 'Lowest'
                  ? '▼'
                  : '●'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: t.text, lineHeight: 1.4 }}>
                  {issue.summary}
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    marginTop: 2,
                  }}
                >
                  <span
                    style={{
                      fontFamily: t.fm,
                      fontSize: 10,
                      color: t.accent,
                    }}
                  >
                    {issue.key}
                  </span>
                  <span
                    style={{
                      fontFamily: t.fm,
                      fontSize: 10,
                      color: t.muted,
                    }}
                  >
                    {issue.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
