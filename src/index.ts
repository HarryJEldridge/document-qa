import 'dotenv/config';
import { migrate } from './db/migrate';
import { buildBriefingContext } from './briefing/builder';
import { generateBriefing } from './briefing/claude';
import {
  renderHeader,
  renderSourceStatus,
  renderErrors,
  renderBriefingLabel,
  renderFooter,
} from './briefing/renderer';
import db from './db/client';

async function main(): Promise<void> {
  const startMs = Date.now();

  // Ensure schema is up to date before anything else
  migrate();

  renderHeader();

  console.log('  Gathering data sources...\n');
  const ctx = await buildBriefingContext();

  renderSourceStatus(ctx);
  renderErrors(ctx.errors);
  renderBriefingLabel();

  const briefingText = await generateBriefing(ctx);

  // Persist the briefing for API / dashboard access
  db.prepare(
    'INSERT INTO briefings (date, context_json, output_text) VALUES (?, ?, ?)'
  ).run(new Date().toISOString().slice(0, 10), JSON.stringify(ctx), briefingText);

  renderFooter(startMs);
}

main().catch((err: unknown) => {
  console.error('\nFatal error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
