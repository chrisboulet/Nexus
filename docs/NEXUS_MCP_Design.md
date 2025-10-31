# NEXUS MCP Server - Technical Design

**Version**: 1.0
**Date**: 31 octobre 2025
**Status**: Design Phase

---

## 🎯 Purpose

Create a **Model Context Protocol (MCP) server** as a Supabase Edge Function to expose NEXUS data (Limitless conversations, Notion priorities, CRM) to Claude Desktop for interactive queries.

## 🏗️ Architecture

### Deployment Model

**Platform**: Supabase Edge Function (Deno runtime)
**Transport**: HTTP (RESTful MCP endpoint)
**Location**: `supabase/functions/nexus-mcp/`

### Integration with Existing NEXUS

```
┌────────────────────────────────────────────────────┐
│              Supabase Platform                     │
├────────────────────────────────────────────────────┤
│                                                    │
│  ⏰ pg_cron Schedulers (Unchanged)                │
│     ├─ nexus-realtime-sync (*/30 12-23 * * *)    │
│     └─ nexus-weekly-sync (0 19 * * 5)            │
│           ↓                                        │
│  📊 PostgreSQL Database                           │
│     ├─ priorities_cache (populated by syncs)     │
│     └─ sync_logs                                  │
│           ↑                                        │
│  🔍 NEW: nexus-mcp Edge Function                 │
│     ├─ Read-only queries                          │
│     ├─ Exposes via MCP tools                      │
│     └─ No writes (syncs handle that)             │
│                                                    │
└────────────────────────────────────────────────────┘
         ↑
         │ HTTP (MCP Protocol)
         │
┌────────────────────┐
│  Claude Desktop    │
│  (Windows)         │
└────────────────────┘
```

**Key Principles:**
1. **Read-only MCP**: No data modification via MCP (keeps syncs authoritative)
2. **Reuse existing clients**: Leverage `_shared/clients/` (Limitless, Notion)
3. **Thin wrapper**: MCP server is just an HTTP interface to existing logic
4. **No duplication**: Syncs remain the source of truth

---

## 🛠️ MCP Tools Specification

### 1. `nexus_search_conversations`

**Purpose**: Search Limitless conversations by text query

**Input Schema:**
```typescript
{
  query: string;           // Search query (e.g., "Marc Veilleux", "agents IA")
  days?: number;           // Optional: limit to last N days (default: 30)
  limit?: number;          // Optional: max results (default: 10)
}
```

**Implementation:**
```typescript
// Calls LimitlessClient.getConversationsSinceLastSync()
// Filters by text match in transcript/summary
// Returns formatted results
```

**Output Format:**
```
Found 3 conversations for "Marc Veilleux":

1. **Call: ESI Tech - Agent Support Discussion** (Jan 26, 9:00 AM)
   "Promis de revenir avec une proposition agent support cette semaine"
   Priority detected: Préparer proposition Fractional CTO

2. ...
```

### 2. `nexus_get_priority`

**Purpose**: Get details of a specific priority by ID or title

**Input Schema:**
```typescript
{
  id?: string;             // Notion page ID
  title?: string;          // Priority title (fuzzy match)
}
```

**Implementation:**
```typescript
// Calls NotionClient.queryPriorityDatabase()
// Returns full priority details
```

**Output Format:**
```
Priority: Préparer proposition Fractional CTO pour Marc Veilleux (ESI)

📋 Type: engagement
⏰ Deadline: Cette semaine (Friday)
🎯 Context: @ordi
📝 Description: Créer proposition agent support client basée sur conversation du 26 jan
🔗 Source: Limitless conversation (Jan 26, 9:00 AM)
✨ Confidence: 0.95
```

### 3. `nexus_list_priorities`

**Purpose**: List priorities with optional filters

**Input Schema:**
```typescript
{
  status?: 'active' | 'completed' | 'all';  // Default: 'active'
  days?: number;                             // Created in last N days
  context?: string;                          // Filter by context tag (@appels, @ordi)
  limit?: number;                            // Default: 20
}
```

**Implementation:**
```typescript
// Query priorities_cache or Notion database
// Apply filters
// Sort by deadline/created_at
```

**Output Format:**
```
Active Priorities (5 items):

🔴 HIGH - Préparer proposition ESI Tech (Deadline: Friday)
🟡 MEDIUM - Envoyer CV à Guy Tremblay (Deadline: Cette semaine)
🟢 LOW - Réviser architecture InnovIA (No deadline)
...
```

### 4. `nexus_crm_lookup`

**Purpose**: Lookup CRM information (leads, clients) by name/company

**Input Schema:**
```typescript
{
  name?: string;           // Person name
  company?: string;        // Company name
  type?: 'lead' | 'client' | 'all';  // Default: 'all'
}
```

**Implementation:**
```typescript
// Query Notion CRM databases (Leads, Clients)
// Return enriched contact info
```

**Output Format:**
```
CRM Lookup: "Marc Veilleux"

👤 Contact: Marc Veilleux
🏢 Company: ESI Tech
📊 Status: 🔥 Chaud (Hot Lead)
📅 Last Interaction: Jan 26, 2025
🎯 Next Action: Envoyer proposal agent support
💼 Projects Discussed: Agent support client, IA générative
```

### 5. `nexus_list_commitments`

**Purpose**: List recent commitments made in conversations

**Input Schema:**
```typescript
{
  days?: number;           // Last N days (default: 7)
  status?: 'pending' | 'completed' | 'all';
  limit?: number;          // Default: 10
}
```

**Implementation:**
```typescript
// Query priorities_cache where type = 'engagement'
// Filter by date range and status
```

**Output Format:**
```
Commitments (Last 7 Days):

✅ Envoyer case studies IA à Guy Tremblay - COMPLETED (Jan 24)
⏳ Préparer proposition ESI Tech - PENDING (Due: Friday)
⏳ Revenir avec estimation projet InnovIA - PENDING (Due: Next week)
```

---

## 📁 File Structure

```
supabase/functions/nexus-mcp/
├── index.ts                    # Main MCP server entry point
├── tools.ts                    # MCP tool definitions
├── handlers/
│   ├── conversations.ts        # nexus_search_conversations handler
│   ├── priorities.ts           # nexus_get_priority, nexus_list_priorities
│   ├── crm.ts                  # nexus_crm_lookup handler
│   └── commitments.ts          # nexus_list_commitments handler
├── utils/
│   └── mcp-protocol.ts         # MCP protocol helpers (request/response formatting)
└── types.ts                    # MCP-specific TypeScript types
```

**Reused from `_shared/`:**
- `clients/limitless.ts`
- `clients/notion.ts`
- `clients/claude.ts` (if needed for analysis)
- `types/index.ts`
- `utils/logger.ts`
- `utils/supabase-client.ts`

---

## 🔌 MCP Protocol Implementation

### HTTP Endpoint

**URL**: `https://llxgkvxqznibjnzninza.supabase.co/functions/v1/nexus-mcp`

**Method**: POST

**Request Format** (JSON-RPC style):
```json
{
  "method": "tools/list" | "tools/call",
  "params": {
    "name": "nexus_search_conversations",
    "arguments": {
      "query": "Marc Veilleux",
      "days": 30
    }
  }
}
```

**Response Format**:
```json
{
  "content": [
    {
      "type": "text",
      "text": "Found 3 conversations for \"Marc Veilleux\":..."
    }
  ]
}
```

### Authentication

**Method**: Supabase Anon Key via Authorization header

```typescript
// Claude Desktop config
{
  "mcpServers": {
    "nexus": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/sdk", "client", "https://..."],
      "env": {
        "SUPABASE_ANON_KEY": "eyJhbG..."
      }
    }
  }
}
```

**Security**: RLS policies ensure read-only access via anon key.

---

## 🚀 Implementation Plan

### Phase 2.1: Scaffold MCP Structure (1 day)

**Tasks:**
1. Create `supabase/functions/nexus-mcp/` directory
2. Set up `index.ts` with basic MCP protocol handler
3. Define tool schemas in `tools.ts`
4. Create handler placeholders in `handlers/`

**Acceptance Criteria:**
- MCP server responds to `tools/list` request
- Returns 5 tool definitions

### Phase 2.2: Implement Handlers (2 days)

**Priority Order:**
1. `nexus_list_priorities` (simplest, uses existing DB)
2. `nexus_search_conversations` (reuses LimitlessClient)
3. `nexus_get_priority` (Notion lookup)
4. `nexus_crm_lookup` (Notion CRM)
5. `nexus_list_commitments` (filtered priorities)

**For Each Handler:**
- Parse MCP arguments
- Call existing client (Limitless/Notion)
- Format response as MCP content
- Add error handling

### Phase 2.3: Local Testing (1 day)

**Test Setup:**
```bash
# Serve locally
supabase functions serve nexus-mcp --env-file .env

# Test with curl
curl -X POST http://localhost:54321/functions/v1/nexus-mcp \
  -H "Content-Type: application/json" \
  -d '{"method":"tools/list"}'
```

**Test Cases:**
- ✅ List all tools
- ✅ Call each tool with valid args
- ✅ Call tool with invalid args (error handling)
- ✅ Verify response format matches MCP spec

### Phase 2.4: Deploy & Integration (0.5 day)

**Deploy:**
```bash
supabase functions deploy nexus-mcp
```

**Configure Claude Desktop:**
Edit `claude_desktop_config.json` to add nexus MCP.

**Validation:**
- Claude Desktop sees NEXUS tools
- Can invoke tools successfully
- Responses render correctly

---

## 📊 Success Metrics

**Phase 2 Complete When:**
1. ✅ All 5 MCP tools implemented and working
2. ✅ Claude Desktop successfully connects to NEXUS MCP
3. ✅ Can query conversations, priorities, CRM via Claude
4. ✅ Responses are formatted, readable, actionable
5. ✅ Error handling gracefully reports issues

**Performance Targets:**
- Tool invocation: <500ms (p95)
- Conversation search: <1s for 30 days of data
- Priority lookup: <300ms

**Cost Target:**
- Free tier Supabase (existing project, no new costs)

---

## 🔮 Future Enhancements (Post Phase 2)

### Additional Tools
- `nexus_analyze_topic`: Deep-dive analysis of conversation topic
- `nexus_suggest_priorities`: AI-suggested next actions
- `nexus_track_project`: Monitor project mentions across conversations

### Optimizations
- Cache frequently accessed priorities
- Batch conversation queries
- Add semantic search (embeddings)

### Integration
- Webhook support for real-time updates
- Export to other tools (Google Calendar, Slack)

---

## 🎯 Next Steps

**Immediate Actions:**
1. Review this design doc with Christian
2. Get approval on tool schemas and outputs
3. Start Phase 2.1 (scaffold MCP structure)

**Questions to Resolve:**
- Should we expose raw conversation transcripts via MCP?
- Do we need write operations (e.g., mark priority completed)?
- Should CRM lookup include project history?

---

**Document Status**: Ready for Review
**Author**: Claude Code
**Last Updated**: 2025-10-31
