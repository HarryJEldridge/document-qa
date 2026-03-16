# Personal OS — Claude Code Context

## Project Overview

Full-stack personal intelligence platform for Harry Eldridge, Director of Business Value Engineering at Phocas Software (Newport Beach, CA).

Aggregates Apple Reminders, Google/Outlook Calendar, Gmail, Oura health data, Confluence, HubSpot, Jira, and Excel models into a daily briefing via CLI, web dashboard, and API.

## Architecture

```
src/data-sources/   ← One file per integration. fetch*() → typed context object.
src/briefing/       ← builder assembles context, claude calls API, renderer formats output
src/db/             ← SQLite via better-sqlite3 at ~/.personal-os/data.db
src/crm/            ← Personal CRM layer on top of SQLite
src/server.ts       ← Express API for web dashboard (port 3000)
web/                ← React + Vite frontend (Phase 2)
```

## Coding Conventions

- TypeScript strict mode. Avoid `any` — use `unknown` + type guards or explicit casts with a comment.
- All API keys via `.env`. Never hardcode credentials.
- Each `data-sources/` file exports a single `fetch*()` function that returns a typed context object. Never return raw API responses.
- Graceful degradation: data source errors are collected in `BriefingContext.errors`, never crash the briefing.
- One file per integration — no shared HTTP clients.
- All data-source functions throw on missing config (key/token not set). The builder catches and records these as `skipped: true` errors.

## Personal Context (inject into all Claude prompts)

- **Owner:** Harry Eldridge
- **Role:** Director of Business Value Engineering, Phocas Software
- **Location:** Newport Beach, CA (PST/PDT)
- **Direct reports:** Pete McFadden, Denise McGettigan, Neil Cooper, Alix, Nick, Dave
- **CRO:** Matthew Kantelis | **CEO:** Myles Glashier
- **Physical:** 6'2" (188cm), ~90kg, active fitness goal
- **Wearables:** Apple Watch + Oura Ring
- **Reading list:** Never Split the Difference, The Culture Code, Thinking Fast and Slow, Principles, Meditations, Measure What Matters, Crossing the Chasm

## Reminders List IDs

| List            | ID                                     |
|-----------------|----------------------------------------|
| Daily Briefing  | `AD2A476E-420D-4B8C-8856-BB0DEB1D518A` |
| GTM Engineering | `603D0B69-A927-464C-B6F3-A7E068F5F106` |
| Certifications  | `C1D699B2-18E7-4BFC-BBAE-6C4D0805E3D9` |
| Matt K          | `89953772-8058-47C1-8B0F-44B46D1DFABC` |

## Stack

| Layer         | Tech                                   |
|---------------|----------------------------------------|
| Backend / CLI | Node.js + TypeScript                   |
| Frontend      | React + Vite (dark theme)              |
| Database      | SQLite via `better-sqlite3`            |
| API server    | Express (port 3000)                    |
| AI            | Claude API — `claude-opus-4-6`         |

## Design Tokens

```
Background:  #0b0d11
Surface:     #12151c / #191d27
Accent:      #5b8dee   (steel blue)
Green:       #5bc4a0
Warning:     #e0b86a
Red:         #e07878
Fonts:       Bebas Neue (headings), DM Sans (body), DM Mono (data)
Layout:      Mobile-first, 430px max-width
```

## Phase Status

- **Phase 1** — CLI briefing (Reminders, Calendar, Health, HubSpot, Jira, Confluence, web) ✅
- **Phase 2** — React web dashboard + Gmail + Excel 🔲
- **Phase 3** — Voice, notifications, mobile 🔲

## Commands

```bash
npm run brief       # Morning briefing CLI
npm run dev         # API server (port 3000)
npm run build       # Compile TypeScript → dist/
npm run db:migrate  # Apply pending DB migrations
```

## Setup

```bash
cp .env.example .env
# Fill in API keys
npm install
npm run db:migrate
npm run brief
```
