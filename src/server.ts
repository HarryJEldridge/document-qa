/**
 * Express API server — serves stored briefings to the React dashboard.
 * Phase 1: read-only briefing history.
 * Phase 2: add real-time data endpoints, CRM CRUD, and webhook triggers.
 */
import 'dotenv/config';
import express, { Request, Response } from 'express';
import { migrate } from './db/migrate';
import db from './db/client';
import type { StoredBriefing } from './types/index';

const app = express();
const PORT = parseInt(process.env.PORT ?? '3000', 10);

app.use(express.json());

// Allow React dev server in development
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

app.get('/api/briefings', (_req: Request, res: Response) => {
  const rows = db
    .prepare(
      'SELECT id, date, output_text, created_at FROM briefings ORDER BY created_at DESC LIMIT 30'
    )
    .all() as Pick<StoredBriefing, 'id' | 'date' | 'output_text' | 'created_at'>[];
  res.json(rows);
});

app.get('/api/briefings/latest', (_req: Request, res: Response) => {
  const row = db
    .prepare('SELECT * FROM briefings ORDER BY created_at DESC LIMIT 1')
    .get() as StoredBriefing | undefined;

  if (!row) {
    res.status(404).json({
      error: 'No briefings yet. Run `npm run brief` to generate one.',
    });
    return;
  }
  res.json(row);
});

app.get('/api/briefings/:id', (req: Request, res: Response) => {
  const row = db
    .prepare('SELECT * FROM briefings WHERE id = ?')
    .get(parseInt(req.params.id, 10)) as StoredBriefing | undefined;

  if (!row) {
    res.status(404).json({ error: 'Briefing not found' });
    return;
  }
  res.json(row);
});

// ── Start ─────────────────────────────────────────────────────────────────────

migrate();

app.listen(PORT, () => {
  console.log(`Personal OS API → http://localhost:${PORT}`);
  console.log(`  GET /api/briefings/latest`);
  console.log(`  GET /api/briefings`);
});
