import 'dotenv/config';
import express, { Request, Response } from 'express';
import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';
import { networkInterfaces } from 'os';
import { migrate } from './db/migrate';
import db from './db/client';
import type { StoredBriefing } from './types/index';

function getLanIp(): string | null {
  const nets = networkInterfaces();
  for (const iface of Object.values(nets)) {
    for (const net of iface ?? []) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return null;
}

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

// POST /api/briefings/generate — spawns the CLI briefing process
app.post('/api/briefings/generate', (_req: Request, res: Response) => {
  const proc = spawn(
    'npx',
    ['ts-node', 'src/index.ts'],
    {
      cwd: join(__dirname, '..'),
      env: process.env,
      stdio: 'pipe',
    }
  );

  // Fire-and-forget: client polls /api/briefings/latest for the result
  res.json({ ok: true, message: 'Briefing generation started' });

  proc.on('error', (err) => {
    console.error('[generate] spawn error:', err.message);
  });
  proc.on('close', (code) => {
    console.log(`[generate] process exited with code ${code}`);
  });
});

// ── Serve React web build in production ───────────────────────────────────────

const webDist = join(__dirname, '..', 'web', 'dist');
if (existsSync(webDist)) {
  app.use(express.static(webDist));
  // SPA fallback — serve index.html for all non-API routes
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(join(webDist, 'index.html'));
  });
}

// ── Start ─────────────────────────────────────────────────────────────────────

migrate();

// Bind to 0.0.0.0 so the server is reachable from other devices on the LAN
app.listen(PORT, '0.0.0.0', () => {
  const lan = getLanIp();
  console.log(`\nPersonal OS running\n`);
  console.log(`  Local   → http://localhost:${PORT}`);
  if (lan) {
    console.log(`  iPhone  → http://${lan}:${PORT}  ← open this on your phone`);
  }
  console.log('');
});
