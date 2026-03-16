import { t } from '../design/tokens';
import type { RemindersContext, ReminderItem } from '../types';

interface Props {
  reminders: RemindersContext;
}

const PRIORITY_COLORS: Record<number, string> = {
  9: '#e07878',
  5: '#e0b86a',
  1: '#5bc4a0',
};

function PriorityDot({ priority }: { priority: number }) {
  const color = PRIORITY_COLORS[priority];
  if (!color) return null;
  return (
    <span
      style={{
        display: 'inline-block',
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: color,
        marginRight: 6,
        flexShrink: 0,
        marginTop: 6,
      }}
    />
  );
}

function ReminderRow({ item }: { item: ReminderItem }) {
  const isOverdue =
    item.dueDate && new Date(item.dueDate).getTime() < Date.now();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 0,
        padding: '6px 0',
        borderBottom: `1px solid ${t.border}`,
      }}
    >
      <PriorityDot priority={item.priority} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: t.text, lineHeight: 1.4 }}>
          {item.title}
        </div>
        {item.dueDate && (
          <div
            style={{
              fontFamily: t.fm,
              fontSize: 11,
              color: isOverdue ? t.red : t.muted,
              marginTop: 1,
            }}
          >
            {isOverdue ? '⚠ ' : ''}
            {new Date(item.dueDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              timeZone: 'America/Los_Angeles',
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function RemindersPanel({ reminders }: Props) {
  const populated = reminders.lists.filter((l) => l.items.length > 0);

  if (populated.length === 0) {
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
        All clear
      </div>
    );
  }

  return (
    <div>
      {populated.map((list, i) => (
        <div key={list.id} style={{ marginBottom: i < populated.length - 1 ? 16 : 0 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontFamily: t.fm,
                fontSize: 10,
                color: t.muted,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              {list.name}
            </span>
            <span
              style={{
                fontFamily: t.fm,
                fontSize: 11,
                color: t.accent,
                background: 'rgba(91,141,238,0.12)',
                padding: '1px 7px',
                borderRadius: 100,
              }}
            >
              {list.items.length}
            </span>
          </div>
          {list.items.map((item, j) => (
            <ReminderRow key={j} item={item} />
          ))}
        </div>
      ))}
    </div>
  );
}
