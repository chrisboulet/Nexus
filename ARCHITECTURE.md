# Nexus Architecture Diagram

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         NEXUS ASSISTANT                          │
│                Strategic Coordination & Unified Tracking         │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
        ┌───────────────────────┐   ┌──────────────────────┐
        │   main.py             │   │   NexusCoordinator   │
        │   Entry Point         │──▶│   Orchestration      │
        └───────────────────────┘   └──────────────────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
                    ▼                        ▼                        ▼
        ┌────────────────────┐  ┌─────────────────────┐  ┌────────────────────┐
        │  LimitlessClient   │  │ GoogleCalendarClient│  │  NotionCRMClient   │
        │  ───────────────   │  │  ─────────────────  │  │  ────────────────  │
        │  • get_memories    │  │  • authenticate     │  │  • get_entries     │
        │  • get_notes       │  │  • get_events       │  │  • create_page     │
        │  • search_context  │  │  • get_upcoming     │  │  • update_page     │
        └────────────────────┘  └─────────────────────┘  └────────────────────┘
                    │                        │                        │
                    │                        │                        │
                    ▼                        ▼                        ▼
        ┌────────────────────┐  ┌─────────────────────┐  ┌────────────────────┐
        │   Limitless API    │  │  Google Calendar    │  │    Notion API      │
        │   ──────────────   │  │  ────────────────   │  │  ──────────────    │
        │  REST API          │  │  REST API           │  │  REST API          │
        │  Bearer Token      │  │  OAuth 2.0          │  │  Integration Token │
        └────────────────────┘  └─────────────────────┘  └────────────────────┘
```

## Data Flow Diagram

```
┌───────────────────────────────────────────────────────────────────────┐
│                            DATA SOURCES                                │
└───────────────────────────────────────────────────────────────────────┘

┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   LIMITLESS     │      │ GOOGLE CALENDAR │      │   NOTION CRM    │
│  ─────────────  │      │ ─────────────── │      │  ─────────────  │
│                 │      │                 │      │                 │
│ • Meeting Notes │      │ • Events        │      │ • Existing Data │
│ • Memories      │      │ • Attendees     │      │ • Tasks         │
│ • Context       │      │ • Descriptions  │      │ • Projects      │
│ • Action Items  │      │ • Times/Dates   │      │ • Contacts      │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         │ FETCH                  │ FETCH                  │ READ/WRITE
         │                        │                        │
         ▼                        ▼                        ▼
┌───────────────────────────────────────────────────────────────────────┐
│                       NEXUS COORDINATOR                                │
│  ────────────────────────────────────────────────────────────────     │
│                                                                        │
│  1. Connect to Services                                                │
│     ├─ Authenticate with Google Calendar (OAuth)                      │
│     ├─ Validate Limitless API Key                                     │
│     └─ Verify Notion Access                                           │
│                                                                        │
│  2. Fetch Data                                                         │
│     ├─ Get meeting notes from Limitless                               │
│     ├─ Get calendar events from Google                                │
│     └─ Query existing Notion entries                                  │
│                                                                        │
│  3. Transform & Map                                                    │
│     ├─ Convert calendar events → Notion pages                         │
│     ├─ Convert meeting notes → Notion pages                           │
│     └─ Extract action items → To-do lists                             │
│                                                                        │
│  4. Synchronize                                                        │
│     ├─ Create new Notion pages                                        │
│     ├─ Update existing pages                                          │
│     └─ Log operations                                                 │
│                                                                        │
│  5. Report Results                                                     │
│     ├─ Count synced items                                             │
│     ├─ Log errors                                                     │
│     └─ Return statistics                                              │
└───────────────────────────────────────────────────────────────────────┘
                                  │
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────────┐
│                        UNIFIED NOTION CRM                              │
│  ────────────────────────────────────────────────────────────────     │
│                                                                        │
│  Database with:                                                        │
│  • Calendar Events (synced from Google)                               │
│  • Meeting Notes (synced from Limitless)                              │
│  • Action Items (extracted as to-dos)                                 │
│  • Attendees (multi-select)                                           │
│  • Dates & Times                                                      │
│  • Descriptions & Context                                             │
└───────────────────────────────────────────────────────────────────────┘
```

## Component Interaction Flow

```
┌──────────┐
│  START   │
└────┬─────┘
     │
     ▼
┌─────────────────────┐
│ Load Configuration  │  ◀─── config.json
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Initialize Clients  │
└─────────┬───────────┘
          │
          ├─────────────────┬─────────────────┬─────────────────┐
          ▼                 ▼                 ▼                 ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐    ┌──────────┐
    │Limitless │      │  Google  │      │  Notion  │    │  Logger  │
    │ Client   │      │ Calendar │      │  Client  │    │  Setup   │
    └────┬─────┘      └────┬─────┘      └────┬─────┘    └────┬─────┘
         │                 │                  │               │
         └─────────────────┴──────────────────┴───────────────┘
                           │
                           ▼
                 ┌─────────────────────┐
                 │ Connect to Services │
                 └─────────┬───────────┘
                           │
                    ┌──────┴──────┐
                    │             │
                    ▼             ▼
          ┌──────────────┐   ┌──────────────┐
          │ Sync Once?   │   │ Continuous?  │
          └──────┬───────┘   └──────┬───────┘
                 │                  │
                 │                  └─────┐
                 ▼                        │
        ┌────────────────┐                │
        │  Run Sync      │ ◀──────────────┘
        │  Cycle         │      (loop with interval)
        └────────┬───────┘
                 │
                 ├──────────────────┬──────────────────┐
                 ▼                  ▼                  ▼
    ┌─────────────────────┐  ┌──────────────┐  ┌─────────────┐
    │ Fetch Limitless     │  │ Fetch Google │  │ Fetch Notion│
    │ Meeting Notes       │  │ Calendar     │  │ Entries     │
    └─────────┬───────────┘  └──────┬───────┘  └──────┬──────┘
              │                     │                  │
              └─────────────────────┴──────────────────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │  Transform      │
                          │  Data           │
                          └─────────┬───────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │  Create/Update  │
                          │  Notion Pages   │
                          └─────────┬───────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │  Log Results    │
                          └─────────┬───────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │  Return Stats   │
                          └─────────────────┘
```

## File Structure Map

```
Nexus/
│
├─── Configuration Layer
│    ├── config.json          (User credentials - private)
│    ├── config.example.json  (Template)
│    └── .gitignore          (Security rules)
│
├─── Application Layer
│    ├── main.py             (Entry point)
│    └── setup.py            (Installation)
│
├─── Core Logic Layer (src/)
│    │
│    ├── coordinators/
│    │   └── nexus_coordinator.py  (Main orchestration)
│    │
│    ├── integrations/
│    │   ├── limitless_client.py
│    │   ├── google_calendar_client.py
│    │   └── notion_client.py
│    │
│    └── utils/
│        ├── config.py       (Config management)
│        └── logger.py       (Logging)
│
├─── Testing Layer (tests/)
│    └── test_integrations.py
│
└─── Documentation Layer
     ├── README.md           (Overview)
     ├── QUICKSTART.md       (Quick setup)
     ├── GUIDE.md            (Complete guide)
     ├── NOTION_SETUP.md     (Database setup)
     ├── CONTRIBUTING.md     (Developer guide)
     ├── SUMMARY.md          (Implementation details)
     ├── CHANGELOG.md        (Version history)
     └── ARCHITECTURE.md     (This file)
```

## Sync Process Detail

```
SYNC CYCLE (runs every N minutes)
│
├─ STEP 1: Fetch Calendar Events
│  └─ GET /calendar/v3/calendars/primary/events
│     ├─ Time range: -7 days to +30 days (configurable)
│     ├─ Extract: title, date, description, attendees
│     └─ Result: List of events
│
├─ STEP 2: Fetch Limitless Notes
│  └─ GET /memories & /meetings/notes
│     ├─ Time range: last 7 days (configurable)
│     ├─ Extract: title, content, attendees, action items
│     └─ Result: List of meeting notes
│
├─ STEP 3: Transform Calendar Events
│  └─ For each event:
│     ├─ Create Notion page properties:
│     │  ├─ Name: event.summary
│     │  ├─ Type: "Calendar Event"
│     │  ├─ Date: event.start
│     │  └─ Notes: event.description
│     └─ Format for Notion API
│
├─ STEP 4: Transform Meeting Notes
│  └─ For each note:
│     ├─ Create Notion page properties:
│     │  ├─ Name: note.title
│     │  ├─ Type: "Meeting"
│     │  ├─ Date: note.date
│     │  ├─ Attendees: note.attendees (multi-select)
│     │  └─ Content blocks:
│     │     ├─ Notes section (paragraph)
│     │     └─ Action items (to-do list)
│     └─ Format for Notion API
│
├─ STEP 5: Sync to Notion
│  └─ For each transformed item:
│     ├─ POST /v1/pages
│     ├─ Handle errors
│     ├─ Log success/failure
│     └─ Count synced items
│
└─ STEP 6: Report Results
   ├─ Log sync statistics
   ├─ Update counters
   └─ Wait for next cycle
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
└─────────────────────────────────────────────────────────────┘

1. Configuration Security
   ├─ No hard-coded credentials
   ├─ config.json excluded from git (.gitignore)
   ├─ Credentials stored locally only
   └─ Template provided (config.example.json)

2. API Authentication
   ├─ Limitless: Bearer Token (API Key)
   ├─ Google Calendar: OAuth 2.0 flow
   │  ├─ credentials.json (client secrets)
   │  └─ token.json (access/refresh tokens)
   └─ Notion: Integration Token

3. File System Security
   ├─ .gitignore prevents credential commits
   ├─ token.json auto-generated & excluded
   ├─ credentials.json user-provided & excluded
   └─ All sensitive files in root (easy to manage)

4. Code Security
   ├─ CodeQL analysis: 0 vulnerabilities
   ├─ No SQL injection risks (API-based)
   ├─ No XSS risks (no web interface)
   └─ Safe error handling (no credential leaks)

5. Network Security
   ├─ HTTPS for all API calls
   ├─ OAuth 2.0 for Google (industry standard)
   ├─ API tokens over secure connections
   └─ No credential transmission in URLs
```

## Deployment Scenarios

### Scenario 1: Desktop Usage
```
[User's Computer]
     │
     ├─ Run: python main.py
     ├─ Terminal output shows progress
     └─ Logs saved to nexus.log
```

### Scenario 2: Server Deployment
```
[Server]
     │
     ├─ systemd service
     ├─ Runs in background
     ├─ Continuous sync
     └─ Logs to file
```

### Scenario 3: Scheduled Task
```
[Cron Job / Task Scheduler]
     │
     ├─ Runs hourly: python main.py --sync-once
     ├─ Email notifications on errors
     └─ Log rotation
```

## Technology Stack

```
┌─────────────────────────────────────────┐
│         Application Layer                │
│  Python 3.9+                             │
│  Async/Await (asyncio)                   │
└─────────────────────────────────────────┘
              │
┌─────────────┴─────────────────┬─────────┐
│                               │         │
▼                               ▼         ▼
┌──────────────┐  ┌──────────────┐  ┌────────────┐
│ HTTP Clients │  │    Google    │  │   Notion   │
│ httpx        │  │    APIs      │  │    SDK     │
│ aiohttp      │  │ google-auth  │  │notion-     │
└──────────────┘  │ google-api-  │  │client      │
                  │ python-client│  └────────────┘
                  └──────────────┘
```

---

For implementation details, see [SUMMARY.md](SUMMARY.md)  
For usage instructions, see [GUIDE.md](GUIDE.md)  
For setup instructions, see [QUICKSTART.md](QUICKSTART.md)
