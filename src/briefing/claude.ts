import Anthropic from '@anthropic-ai/sdk';
import type { BriefingContext } from '../types/index';

const client = new Anthropic();

// Web search + web fetch tools (dynamic filtering, no beta header needed)
// Cast as unknown → Anthropic.Tool since SDK types may not yet include these
const WEB_TOOLS = [
  { type: 'web_search_20260209', name: 'web_search' },
  { type: 'web_fetch_20260209', name: 'web_fetch' },
] as unknown as Anthropic.Tool[];

function buildPrompt(ctx: BriefingContext): string {
  const localDate = new Date(ctx.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Los_Angeles',
  });
  const localTime = new Date(ctx.date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Los_Angeles',
  });

  const skippedSources = ctx.errors
    .filter((e) => e.skipped)
    .map((e) => e.source);

  const errorSources = ctx.errors
    .filter((e) => !e.skipped)
    .map((e) => `${e.source} (${e.message})`);

  return `You are generating a morning briefing for ${ctx.owner.name}, ${ctx.owner.role}.

Location: ${ctx.owner.location} — ${localDate} at ${localTime} PST.

## Personal Context
- Direct reports: ${ctx.owner.directReports.join(', ')}
- Leadership: CRO ${ctx.owner.leadership.cro} | CEO ${ctx.owner.leadership.ceo}
- Fitness goal active: ${ctx.owner.fitness.heightCm}cm, ${ctx.owner.fitness.weightKg}kg
- Reading: ${ctx.owner.reading.slice(0, 4).join(' · ')}

## Data Sources
${skippedSources.length ? `Not configured (skipped): ${skippedSources.join(', ')}` : ''}
${errorSources.length ? `Errors: ${errorSources.join(', ')}` : ''}

## Raw Data
\`\`\`json
${JSON.stringify(
  {
    reminders: ctx.reminders,
    calendar: ctx.calendar,
    health: ctx.health,
    hubspot: ctx.hubspot,
    jira: ctx.jira,
    confluence: ctx.confluence,
    web: ctx.web,
  },
  null,
  2
)}
\`\`\`

## Instructions

Generate a sharp, actionable morning briefing with these sections:

**GOOD MORNING, HARRY** — ${localDate}. Pull current Newport Beach weather if not in data. One-line energy setter.

**HEALTH SNAPSHOT** — Readiness score, sleep score + duration, HRV, resting HR. One recovery recommendation. Skip if no data.

**TODAY'S CALENDAR** — Every event with local time (PST). For each: attendees, location, one prep note. Flag back-to-backs.

**OPEN REMINDERS** — All incomplete items, grouped by list. Flag anything overdue or due today.

**CRM PULSE** — Top deals by close date, stage movements, overdue HubSpot tasks. Flag anything needing action today.

**ENGINEERING** — Jira issues by priority. Flag blockers, overdue items, anything stale (>5 days no update).

**CONFLUENCE** — Any recently modified pages worth Harry's attention.

**FOCUS** — Single recommended priority for today. One sentence, decisive.

**COACHING INSIGHT** — A brief, specific insight from the reading list that applies to something in today's data.

---
Rules: Sharp and direct, like a Chief of Staff briefing. No filler. Use web search for anything time-sensitive (news, sports, stock prices) if relevant. Flag missing data sources at the bottom.`;
}

export async function generateBriefing(
  ctx: BriefingContext
): Promise<string> {
  const userMessage: Anthropic.MessageParam = {
    role: 'user',
    content: buildPrompt(ctx),
  };

  let messages: Anthropic.MessageParam[] = [userMessage];
  let fullText = '';

  // Loop handles pause_turn (server-side tool iteration limit)
  for (let attempt = 0; attempt < 5; attempt++) {
    const stream = client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      tools: WEB_TOOLS,
      messages,
    });

    // Stream text tokens to stdout in real time
    stream.on('text', (text) => {
      process.stdout.write(text);
      fullText += text;
    });

    const final = await stream.finalMessage();

    if (final.stop_reason !== 'pause_turn') {
      break;
    }

    // pause_turn means the server-side tool loop hit its limit — continue
    messages = [
      userMessage,
      { role: 'assistant', content: final.content },
    ];
  }

  process.stdout.write('\n');
  return fullText;
}
