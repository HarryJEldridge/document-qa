import chalk from 'chalk';
import type { BriefingContext, DataSourceError } from '../types/index';

const ACCENT = '#5b8dee';
const GREEN = '#5bc4a0';
const WARN = '#e0b86a';
const RED = '#e07878';
const GRAY = '#6b7280';

export function renderHeader(): void {
  const now = new Date();
  const date = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Los_Angeles',
  });
  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Los_Angeles',
  });

  console.log();
  console.log(chalk.hex(ACCENT).bold('━'.repeat(62)));
  console.log(
    chalk.hex(ACCENT).bold('  PERSONAL OS') +
      chalk.hex(GRAY)('  ·  Morning Briefing')
  );
  console.log(chalk.hex(GRAY)(`  ${date}  ·  ${time} PST`));
  console.log(chalk.hex(ACCENT).bold('━'.repeat(62)));
  console.log();
}

export function renderSourceStatus(ctx: BriefingContext): void {
  const sources: Array<{ name: string; hasData: boolean }> = [
    { name: 'Reminders', hasData: !!ctx.reminders },
    { name: 'Calendar', hasData: !!ctx.calendar },
    { name: 'Health', hasData: !!ctx.health },
    { name: 'HubSpot', hasData: !!ctx.hubspot },
    { name: 'Jira', hasData: !!ctx.jira },
    { name: 'Confluence', hasData: !!ctx.confluence },
    { name: 'Web', hasData: !!ctx.web },
  ];

  const errMap = new Map<string, DataSourceError>(
    ctx.errors.map((e) => [e.source, e])
  );

  const chips = sources.map(({ name, hasData }) => {
    const err = errMap.get(name);
    if (err?.skipped) return chalk.hex(GRAY)(`${name} —`);
    if (err) return chalk.hex(RED)(`${name} ✗`);
    if (hasData) return chalk.hex(GREEN)(`${name} ✓`);
    return chalk.hex(GRAY)(`${name} ?`);
  });

  console.log(chalk.hex(GRAY)('  ') + chips.join(chalk.hex(GRAY)('  ')));
  console.log();
}

export function renderErrors(errors: DataSourceError[]): void {
  const real = errors.filter((e) => !e.skipped);
  if (real.length === 0) return;

  console.log(chalk.hex(WARN).bold('  ⚠  Source Errors'));
  for (const e of real) {
    console.log(chalk.hex(WARN)(`    · ${e.source}: ${e.message}`));
  }
  console.log();
}

export function renderBriefingLabel(): void {
  console.log(chalk.hex(GRAY)('  ─'.repeat(31)));
  console.log(
    chalk.hex(ACCENT)('  ▶ ') + chalk.bold('Generating briefing...')
  );
  console.log(chalk.hex(GRAY)('  ─'.repeat(31)));
  console.log();
}

export function renderFooter(startMs: number): void {
  const elapsed = ((Date.now() - startMs) / 1000).toFixed(1);
  console.log();
  console.log(chalk.hex(ACCENT).bold('━'.repeat(62)));
  console.log(
    chalk.hex(GRAY)(
      `  Generated in ${elapsed}s  ·  Personal OS v1.0  ·  claude-opus-4-6`
    )
  );
  console.log(chalk.hex(ACCENT).bold('━'.repeat(62)));
  console.log();
}
