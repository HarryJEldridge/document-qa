# Personal OS

**Owner:** Harry Eldridge — Newport Beach, CA (PST/PDT)
**Role:** Director of Business Value Engineering, Phocas Software

---

## What This Is

A full-stack personal intelligence platform. Aggregates data from Reminders, Calendar, Gmail, Health, Confluence, HubSpot, Jira, and Excel into a daily briefing delivered via CLI, web dashboard, and API.

---

## Stack

| Layer | Tech |
|---|---|
| Backend + CLI | Node.js + TypeScript |
| Frontend | React + Vite (dark theme) |
| Database | SQLite via `better-sqlite3` |
| API Server | Express (port 3000) |
| AI | Claude API — `claude-sonnet-4-20250514` |

---

## Commands

```bash
npm run brief       # Generate morning briefing (CLI)
npm run dev         # Start web dashboard + API server
npm run build       # Compile TypeScript
npm run db:migrate  # Run database migrations
```

---

## Data Sources

| Source | Status |
|---|---|
| Apple Reminders | LIVE via MCP |
| Google Calendar | LIVE via MCP |
| Gmail | LIVE via MCP |
| Apple Health | NEEDS Oura API + Health export pipeline |
| Oura Ring | NEEDS API key — [dashboard.ouraring.com](https://dashboard.ouraring.com) |
| Confluence | NEEDS API token |
| HubSpot | NEEDS API key (IT approval in progress) |
| Jira | NEEDS API token |
| Excel Models | NEEDS file path config |
| Weather / News / Sports | Web search (Claude native) |

---

## Design System

```
Background:  #0b0d11
Surface:     #12151c / #191d27
Accent:      #5b8dee  (steel blue)
Green:       #5bc4a0
Warning:     #e0b86a
Red:         #e07878

Fonts:
  Headings:  Bebas Neue
  Body:      DM Sans
  Data:      DM Mono

Layout: Mobile-first, 430px max-width
```

---

## Project Structure

```
personal-os/
├── CLAUDE.md                        ← Claude Code context file
├── package.json
├── tsconfig.json
├── .env.example
│
├── src/
│   ├── index.ts                     ← CLI entry point
│   ├── server.ts                    ← Express API server (port 3000)
│   │
│   ├── data-sources/                ← One file per integration (fetch only)
│   │   ├── reminders.ts             ← Apple Reminders (MCP)
│   │   ├── calendar.ts              ← Google/Outlook Calendar (MCP)
│   │   ├── gmail.ts                 ← Gmail (MCP)
│   │   ├── health.ts                ← Apple Health / Oura API
│   │   ├── confluence.ts            ← Confluence REST API
│   │   ├── hubspot.ts               ← HubSpot API
│   │   ├── jira.ts                  ← Jira REST API
│   │   ├── excel.ts                 ← Excel model parser
│   │   └── web.ts                   ← Weather, news, sports (web search)
│   │
│   ├── briefing/
│   │   ├── builder.ts               ← Assembles context payload
│   │   ├── claude.ts                ← Claude API call + prompt
│   │   └── renderer.ts              ← CLI vs HTML output formatting
│   │
│   ├── crm/
│   │   ├── contacts.ts              ← Personal CRM layer
│   │   └── schema.ts                ← Contact data types
│   │
│   ├── db/
│   │   ├── client.ts                ← SQLite connection
│   │   └── migrations/              ← Schema versioning
│   │
│   └── types/
│       └── index.ts                 ← Shared TypeScript types
│
├── web/                             ← React frontend
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── BriefingCard.tsx
│   │   │   ├── HealthPanel.tsx
│   │   │   ├── CalendarPanel.tsx
│   │   │   ├── RemindersPanel.tsx
│   │   │   └── MetricsPanel.tsx
│   │   └── design/
│   │       └── tokens.ts            ← Design tokens (#0b0d11, #5b8dee, fonts)
│   └── vite.config.ts
│
└── docs/
    └── personal-os.docx             ← Full spec
```

**Coding conventions:**
- TypeScript strict mode throughout
- Never hardcode API keys — always `.env`
- Single responsibility: `data-sources/` fetches, `briefing/` assembles, `claude.ts` calls API
- All data sources return a typed context object, never raw API responses

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the following:

```env
# Claude
ANTHROPIC_API_KEY=

# Oura
OURA_API_KEY=

# Confluence
CONFLUENCE_API_TOKEN=
CONFLUENCE_BASE_URL=

# HubSpot
HUBSPOT_API_KEY=

# Jira
JIRA_API_TOKEN=
JIRA_BASE_URL=
JIRA_EMAIL=

# Excel
EXCEL_FILE_PATH=
```

---

## Key Reminders Lists

| List | ID |
|---|---|
| Daily Briefing | `AD2A476E-420D-4B8C-8856-BB0DEB1D518A` |
| GTM Engineering | `603D0B69-A927-464C-B6F3-A7E068F5F106` |
| Certifications | `C1D699B2-18E7-4BFC-BBAE-6C4D0805E3D9` |
| Matt K | `89953772-8058-47C1-8B0F-44B46D1DFABC` |

---

## Personal Context (Injected Into All Claude Prompts)

- **Location:** Newport Beach, CA
- **Direct Reports:** Pete McFadden, Denise McGettigan, Neil Cooper, Alix, Nick, Dave
- **CRO:** Matthew Kantelis — **CEO:** Myles Glashier
- **Physical:** 6'2", ~90kg, active fitness goal
- **Wearables:** Apple Watch, Oura Ring
- **Reading:** Never Split the Difference, The Culture Code, Thinking Fast and Slow, Principles, Meditations, Measure What Matters, Crossing the Chasm

---

## Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run migrations
npm run db:migrate

# Generate today's briefing
npm run brief

# Start web dashboard
npm run dev
```
