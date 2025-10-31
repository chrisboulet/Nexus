# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**NEXUS** is an AI-powered priority management system that automatically analyzes Limitless conversations and synchronizes priorities to Notion. Built as a serverless TypeScript application on Supabase Edge Functions, it runs automated syncs every 30 minutes during work hours (7 AM - 7 PM EST) and weekly CRM updates on Fridays.

**Key Integrations:**
- **Limitless AI**: Source of conversation data
- **Anthropic Claude**: AI analysis for priority extraction
- **Notion API**: Destination for priorities and CRM data
- **Supabase**: Cloud platform, Edge Functions runtime, PostgreSQL database

## Development Commands

### Supabase Functions

```bash
# Serve Edge Functions locally
deno task dev
# or: supabase functions serve --env-file .env

# Deploy all functions
deno task deploy
# or: supabase functions deploy

# Deploy specific function
deno task deploy:daily
deno task deploy:weekly
# or: supabase functions deploy nexus-realtime-sync
# or: supabase functions deploy nexus-weekly-sync
```

### Testing Functions Manually

```powershell
# Test realtime sync (curl for Windows PowerShell)
curl -X POST "https://llxgkvxqznibjnzninza.supabase.co/functions/v1/nexus-realtime-sync" `
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxseGdrdnhxem5pYmpuem5pbnphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTE1MjYsImV4cCI6MjA3NzA4NzUyNn0.dVQ_FOAJ2t4J3czKqANebDoqj3USNzLG4Tz_wLUrE_E" `
  -H "Content-Type: application/json"

# Test weekly sync
curl -X POST "https://llxgkvxqznibjnzninza.supabase.co/functions/v1/nexus-weekly-sync" `
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxseGdrdnhxem5pYmpuem5pbnphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTE1MjYsImV4cCI6MjA3NzA4NzUyNn0.dVQ_FOAJ2t4J3czKqANebDoqj3USNzLG4Tz_wLUrE_E" `
  -H "Content-Type: application/json"
```

### Database Migrations

```bash
# Create new migration
supabase migration new migration_name

# Apply migrations
supabase db push
```

### Monitoring

```sql
-- View recent sync logs
SELECT sync_type, status, priorities_found, tasks_created, execution_time_ms,
       created_at AT TIME ZONE 'America/Toronto' as created_at_est
FROM sync_logs
ORDER BY created_at DESC
LIMIT 10;

-- Check cron jobs status
SELECT jobname, schedule, active FROM cron.job WHERE jobname LIKE 'nexus-%';

-- View cron execution history
SELECT j.jobname, r.status, r.start_time AT TIME ZONE 'America/Toronto' as start_time_est,
       r.return_message
FROM cron.job_run_details r
JOIN cron.job j ON j.jobid = r.jobid
WHERE j.jobname LIKE 'nexus-%'
ORDER BY r.start_time DESC
LIMIT 20;
```

## Architecture

### Core Components

**Edge Functions (Deno/TypeScript):**
- `nexus-realtime-sync/`: Runs every 30 minutes (7 AM - 7 PM EST) to fetch new Limitless conversations, analyze with Claude, and create priorities in Notion
- `nexus-weekly-sync/`: Runs Friday 2 PM EST to analyze the week's conversations and update CRM data in Notion

**Shared Code (`_shared/`):**
- `clients/limitless.ts`: Limitless AI API integration
- `clients/claude.ts`: Anthropic Claude API for priority analysis
- `clients/notion.ts`: Notion API for priority and CRM management
- `types/index.ts`: TypeScript type definitions
- `utils/logger.ts`: Logging utility
- `utils/supabase-client.ts`: Supabase client helper

**Database (PostgreSQL):**
- `sync_logs`: Execution logs for monitoring
- `priorities_cache`: Deduplication cache for detected priorities

**Cron Scheduling:**
- Uses native PostgreSQL `pg_cron` extension
- Realtime sync: `*/30 12-23 * * *` (every 30 min, 7 AM - 7 PM EST in UTC)
- Weekly sync: `0 19 * * 5` (Friday 2 PM EST in UTC)

### Data Flow

1. **Realtime Sync (Every 30 min):**
   - Fetch Limitless conversations since last sync
   - Analyze with Claude to detect priorities (engagements, requests, deadlines)
   - Deduplicate against `priorities_cache`
   - Create new priorities in Notion
   - Log execution in `sync_logs`

2. **Weekly CRM Sync (Friday 2 PM):**
   - Fetch last 7 days of Limitless conversations
   - Analyze with Claude for CRM insights (leads, clients, projects)
   - Update/create Notion database entries
   - Log execution

### Environment Variables

All secrets stored in Supabase Dashboard (Settings → Functions → Secrets):

**Required:**
- `LIMITLESS_API_KEY`: Limitless API key
- `ANTHROPIC_API_KEY`: Claude API key
- `NOTION_TOKEN`: Notion integration token
- `NOTION_WORKSPACE_ID`: Notion workspace (currently: `a8803c33-4e63-816d-a693-0003102f3eb9`)
- `SUPABASE_URL`: Project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key

**Optional:**
- `LIMITLESS_ENDPOINT`: API endpoint (default: `https://api.limitless.ai/v1`)
- `ANTHROPIC_MODEL`: Claude model (default: `claude-sonnet-4-5-20250929`)
- `NOTION_PRIORITIES_DATABASE_ID`: Notion priorities database ID
- `LOG_LEVEL`: Logging level (default: `info`)

## Important Notes

### Legacy Python Code

The `src/` directory contains legacy Python code from v1.0. The active system now runs on Supabase Edge Functions (TypeScript/Deno). The `src/` directory should be considered deprecated and not modified.

### Deployment Flow

1. Make code changes in `supabase/functions/`
2. Test locally with `deno task dev`
3. Commit and push to Git
4. Deploy functions: `deno task deploy`
5. After secret changes, always redeploy affected functions

### Security

- Never commit API keys or credentials
- All secrets managed via Supabase Dashboard
- Row Level Security (RLS) enabled on database tables
- Service role key only used by Edge Functions (never exposed)

### Timezone Handling

- All cron schedules in UTC
- EST = UTC-5 (winter) or UTC-4 (summer with DST)
- Database stores timestamps in UTC, display queries convert to `America/Toronto`

### Claude Analysis Prompt

The Claude prompt for priority detection is critical. It should:
- Detect commitments made ("je vais te revenir avec...")
- Identify requests received ("peux-tu m'envoyer...")
- Recognize deadlines ("il me faut ça avant...")
- Assign context tags (@appels, @ordi, etc.)
- Return structured JSON with confidence scores

## File Structure

```
supabase/functions/
├── _shared/              # Shared utilities and clients
│   ├── clients/
│   │   ├── limitless.ts  # Limitless API client
│   │   ├── claude.ts     # Claude analysis client
│   │   └── notion.ts     # Notion API client
│   ├── types/index.ts    # TypeScript type definitions
│   └── utils/
│       ├── logger.ts
│       └── supabase-client.ts
├── nexus-realtime-sync/  # 30-min sync Edge Function
│   └── index.ts
└── nexus-weekly-sync/    # Weekly CRM sync Edge Function
    └── index.ts

supabase/migrations/      # Database migrations
├── 20250126140000_create_sync_logs.sql
├── 20250126140100_create_priorities_cache.sql
└── 20250126140200_setup_cron_jobs.sql
```

## MCP Architecture (Model Context Protocol)

### Vision: NEXUS as Knowledge Capitalization Hub

NEXUS is evolving from a standalone priority manager to part of a **modular MCP ecosystem** that capitalizes knowledge from multiple sources via Claude Desktop.

**Architecture Strategy: HYBRID (Local + Serverless)**

```
┌─────────────────────────────────────────────────────────────┐
│                  CLAUDE DESKTOP (Windows)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  MCP Servers Configuration:                                 │
│  ┌──────────────────────────┐  ┌─────────────────────────┐ │
│  │  ytmemory MCP            │  │  NEXUS MCP              │ │
│  │  Mode: LOCAL (stdio)     │  │  Mode: SERVERLESS       │ │
│  │  Docker Desktop          │  │  Supabase Edge Function │ │
│  └──────────────────────────┘  └─────────────────────────┘ │
│           │                              │                  │
└───────────┼──────────────────────────────┼──────────────────┘
            │                              │
            ↓                              ↓
   ┌────────────────┐           ┌───────────────────┐
   │ ytmemory       │           │ NEXUS Backend     │
   │ (Node.js)      │           │ (Deno/Supabase)   │
   │ YouTube Videos │           │ Limitless + Notion│
   └────────────────┘           └───────────────────┘
```

### MCP Servers

**1. ytmemory MCP (External, Local)**
- **Repository**: https://github.com/chrisboulet/ytmemory
- **Purpose**: YouTube video knowledge base (semantic search, recommendations)
- **Deployment**: Local Docker Desktop (stdio transport)
- **Why Local**: Zero latency, no cloud costs, on-demand usage
- **Status**: Production-ready (v2.0 with 8 MCP tools)

**2. NEXUS MCP (To Create, Serverless)**
- **Location**: `supabase/functions/nexus-mcp/` (new function to create)
- **Purpose**: Expose Limitless conversations + Notion priorities for queries
- **Deployment**: Supabase Edge Function (HTTP transport)
- **Why Serverless**: 24/7 availability, works with existing pg_cron syncs
- **Status**: Planned

### Integration Benefits

**Cross-Source Intelligence:**
- Query conversations (Limitless) + video insights (YouTube) simultaneously
- Example: "Prepare call with client about AI agents" → NEXUS finds commitment + ytmemory suggests relevant videos
- Claude Desktop orchestrates both sources via MCP protocol

**Separation of Concerns:**
- ytmemory = Knowledge extraction (videos, learning content)
- NEXUS = Action management (priorities, commitments, CRM)
- Both remain independent, reusable tools

### Implementation Plan

**Phase 1: Validate ytmemory Local** (Complete)
- ytmemory MCP already functional via Docker

**Phase 2: Create NEXUS MCP Serverless** (In Progress)
- Build MCP wrapper for existing NEXUS backend
- Expose 4-5 tools: search_conversations, get_priority, list_priorities, crm_lookup
- Deploy as Supabase Edge Function

**Phase 3: Configure Claude Desktop**
- Add both MCPs to `claude_desktop_config.json`
- Test cross-source queries

**Phase 4: Iteration**
- Optimize tools based on usage patterns
- Add additional tools as needed

### Why NOT Merge ytmemory into NEXUS?

- **Different stacks**: ytmemory (Node.js) vs NEXUS (Deno)
- **Different purposes**: Knowledge extraction vs Action management
- **Reusability**: ytmemory can be used independently by other projects
- **Simplicity**: MCP protocol designed for multi-source integration
- **Cost**: Zero migration effort vs 2-3 weeks rewriting ytmemory in Deno

**Decision**: Keep separate, integrate via MCP (industry-standard protocol).

## Key Resources

- **Supabase Dashboard**: https://supabase.com/dashboard/project/llxgkvxqznibjnzninza
- **Architecture Docs**: `docs/Architecture.md`
- **Deployment Guide**: `docs/Deployment.md`
- **Quick Reference**: `AIDE-MEMOIRE.md` (French cheat sheet)
- **Original Blueprint**: `Blueprint.md`
- **ytmemory Repository**: https://github.com/chrisboulet/ytmemory
