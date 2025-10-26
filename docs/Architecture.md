# NEXUS - Architecture Technique

**Version:** 2.0 (Supabase TypeScript)
**Date:** 26 janvier 2025
**Auteur:** Christian Boulet - Boulet Stratégies TI

---

## 📐 Vue d'Ensemble

NEXUS est un système d'automatisation **serverless** qui analyse vos conversations Limitless et synchronise automatiquement vos priorités dans Google Tasks et votre CRM Notion.

### Stack Technologique

- **Runtime:** Deno (TypeScript)
- **Cloud Platform:** Supabase
- **Edge Functions:** Supabase Edge Functions
- **Database:** PostgreSQL (Supabase)
- **Cron:** pg_cron
- **APIs:**
  - Limitless AI (REST API)
  - Anthropic Claude (SDK TypeScript)
  - Google Tasks (googleapis)
  - Notion (SDK TypeScript)

---

## 🏗️ Architecture Système

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE PLATFORM                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ⏰ pg_cron (Scheduler)                                     │
│     ├─ nexus-realtime-sync (*/30 12-23 * * *)              │
│     │     → Toutes les 30 min (7h AM - 7h PM EST)          │
│     │                                                        │
│     └─ nexus-weekly-sync (0 19 * * 5)                      │
│           → Vendredi 14h EST                                │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🔄 Edge Functions (Deno/TypeScript)                        │
│                                                              │
│     ┌─────────────────────────────────────────┐            │
│     │  nexus-realtime-sync                     │            │
│     ├─────────────────────────────────────────┤            │
│     │  1. Fetch Limitless (depuis dernier sync)│            │
│     │  2. Analyser avec Claude                 │            │
│     │  3. Déduplication (priorities_cache)     │            │
│     │  4. Créer tasks → Google Tasks           │            │
│     │  5. Logger exécution                     │            │
│     └─────────────────────────────────────────┘            │
│                                                              │
│     ┌─────────────────────────────────────────┐            │
│     │  nexus-weekly-sync                       │            │
│     ├─────────────────────────────────────────┤            │
│     │  1. Fetch Limitless (7 derniers jours)   │            │
│     │  2. Analyser CRM avec Claude             │            │
│     │  3. Créer/Update Notion (Leads, Clients) │            │
│     │  4. Logger exécution                     │            │
│     └─────────────────────────────────────────┘            │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🗄️ PostgreSQL Database                                     │
│                                                              │
│     ┌──────────────────┐    ┌────────────────────────┐    │
│     │ sync_logs        │    │ priorities_cache       │    │
│     ├──────────────────┤    ├────────────────────────┤    │
│     │ - sync_type      │    │ - title                │    │
│     │ - status         │    │ - priority_type        │    │
│     │ - priorities_    │    │ - context              │    │
│     │   found          │    │ - source_conversation  │    │
│     │ - tasks_created  │    │ - confidence           │    │
│     │ - error_message  │    │ - processed            │    │
│     │ - execution_time │    │ - created_at           │    │
│     │ - created_at     │    └────────────────────────┘    │
│     └──────────────────┘                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         │                │               │
         ↓                ↓               ↓
    Limitless API    Anthropic API   Google Tasks API
         ↓
    Notion API
```

---

## 📂 Structure du Projet

```
nexus/
├── supabase/
│   ├── functions/
│   │   ├── _shared/                    # Code partagé
│   │   │   ├── clients/                # Clients API
│   │   │   │   ├── limitless.ts        # Limitless API
│   │   │   │   ├── claude.ts           # Claude (Anthropic)
│   │   │   │   ├── google-tasks.ts     # Google Tasks
│   │   │   │   └── notion.ts           # Notion CRM
│   │   │   ├── types/
│   │   │   │   └── index.ts            # TypeScript definitions
│   │   │   └── utils/
│   │   │       ├── logger.ts           # Logging utility
│   │   │       └── supabase-client.ts  # Supabase helper
│   │   │
│   │   ├── nexus-realtime-sync/
│   │   │   └── index.ts                # Sync temps réel
│   │   │
│   │   └── nexus-weekly-sync/
│   │       └── index.ts                # Sync CRM hebdo
│   │
│   ├── migrations/
│   │   ├── 20250126_001_create_sync_logs.sql
│   │   ├── 20250126_002_create_priorities_cache.sql
│   │   └── 20250126_003_setup_cron_jobs.sql
│   │
│   └── config.toml                     # Supabase config
│
├── docs/
│   ├── Architecture.md                 # (ce fichier)
│   ├── Workflow_Quotidien_v2.md        # Guide utilisateur
│   └── Deployment.md                   # Guide déploiement
│
├── deno.json                           # Deno config
├── .env.example                        # Template variables
├── .gitignore
└── README.md
```

---

## 🔄 Workflows

### 1. Realtime Sync (Toutes les 30 min)

**Déclenchement:** pg_cron → `*/30 12-23 * * *`

**Processus:**

```typescript
1. Obtenir timestamp du dernier sync depuis sync_logs
2. Fetch conversations Limitless depuis ce timestamp
3. SI aucune nouvelle conversation:
     → Log success (0 priorités)
     → Exit
4. Analyser avec Claude:
     → Prompt: détecter engagements, demandes, deadlines
     → Retour: JSON avec priorités
5. Déduplication:
     → Vérifier si priorité existe dans priorities_cache
     → Garder seulement les nouvelles
6. SI aucune nouvelle priorité:
     → Log success (0 tasks créées)
     → Exit
7. Créer tasks dans Google Tasks:
     → Format: emoji contexte + titre + [durée]
     → Notes: description complète + métadonnées
8. Cacher les priorités dans priorities_cache
9. Logger l'exécution dans sync_logs
10. Retourner résumé JSON
```

**Exemple de résultat:**

```json
{
  "success": true,
  "conversationsAnalyzed": 3,
  "prioritiesDetected": 5,
  "tasksCreated": 3,
  "errors": [],
  "timestamp": "2025-01-26T14:30:00Z"
}
```

### 2. Weekly CRM Sync (Vendredi 14h)

**Déclenchement:** pg_cron → `0 19 * * 5`

**Processus:**

```typescript
1. Fetch conversations Limitless (7 derniers jours)
2. Analyser avec Claude:
     → Détecter: nouveaux leads, mises à jour clients, projets
     → Retour: JSON structuré CRM
3. Pour chaque lead:
     → Vérifier si existe dans Notion
     → SI existe: Update (statut, dernière interaction)
     → SINON: Create new lead
4. Pour chaque client:
     → Update ou Create dans Notion Clients DB
5. Pour chaque projet:
     → Create dans Notion Projects DB
6. Logger exécution
7. Retourner résumé
```

**Exemple de résultat:**

```json
{
  "success": true,
  "conversationsAnalyzed": 24,
  "leadsCreated": 2,
  "clientsUpdated": 3,
  "projectsCreated": 1,
  "executionTime": 8420
}
```

---

## 🔐 Variables d'Environnement

Toutes les variables sont configurées dans **Supabase Dashboard → Settings → Edge Functions → Secrets**.

### Required

| Variable | Description | Exemple |
|----------|-------------|---------|
| `LIMITLESS_API_KEY` | Limitless API key | `lim_xxxxx` |
| `ANTHROPIC_API_KEY` | Claude API key | `sk-ant-xxxxx` |
| `NOTION_TOKEN` | Notion integration token | `secret_xxxxx` |
| `NOTION_WORKSPACE_ID` | Notion workspace ID | `a8803c33-4e63-816d-a693-0003102f3eb9` |
| `GOOGLE_CREDENTIALS` | Google service account JSON (stringifié) | `{"type":"service_account"...}` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key | `eyJxxx...` |

### Optional

| Variable | Description | Défaut |
|----------|-------------|--------|
| `LIMITLESS_ENDPOINT` | Limitless API endpoint | `https://api.limitless.ai/v1` |
| `ANTHROPIC_MODEL` | Claude model | `claude-sonnet-4-5-20250929` |
| `GOOGLE_TASKS_LIST_ID` | Google Tasks list ID | (créé auto) |
| `LOG_LEVEL` | Logging level | `info` |
| `NOTION_LEADS_DATABASE_ID` | Notion Leads DB | (optionnel) |
| `NOTION_CLIENTS_DATABASE_ID` | Notion Clients DB | (optionnel) |
| `NOTION_PROJECTS_DATABASE_ID` | Notion Projects DB | (optionnel) |

---

## 🗄️ Schéma Base de Données

### Table: `sync_logs`

Logs de toutes les exécutions pour monitoring.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Primary key |
| `sync_type` | TEXT | `realtime`, `weekly` |
| `status` | TEXT | `success`, `error`, `partial` |
| `priorities_found` | INTEGER | Nombre de priorités détectées |
| `tasks_created` | INTEGER | Nombre de tasks créées |
| `error_message` | TEXT | Message d'erreur si applicable |
| `execution_time_ms` | INTEGER | Temps d'exécution en ms |
| `created_at` | TIMESTAMPTZ | Timestamp d'exécution |

**Indexes:**
- `idx_sync_logs_created_at` (DESC)
- `idx_sync_logs_sync_type`
- `idx_sync_logs_status`

### Table: `priorities_cache`

Cache des priorités pour éviter les duplicatas.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Primary key |
| `title` | TEXT | Titre de la priorité |
| `priority_type` | TEXT | `engagement`, `demande`, `deadline` |
| `context` | TEXT | `@appels`, `@ordi`, etc. |
| `source_conversation` | TEXT | Source Limitless |
| `confidence` | DECIMAL(3,2) | Score de confiance (0-1) |
| `processed` | BOOLEAN | Déjà traitée? |
| `created_at` | TIMESTAMPTZ | Date de création |

**Indexes:**
- `idx_priorities_cache_dedup` (UNIQUE sur title + source)
- `idx_priorities_cache_created_at` (DESC)

---

## 📊 Monitoring & Logs

### Visualiser les sync logs

```sql
-- Dernières 10 exécutions
SELECT
  sync_type,
  status,
  priorities_found,
  tasks_created,
  execution_time_ms,
  created_at
FROM sync_logs
ORDER BY created_at DESC
LIMIT 10;
```

### Stats hebdomadaires

```sql
-- Stats des 7 derniers jours
SELECT
  sync_type,
  COUNT(*) as total_runs,
  COUNT(*) FILTER (WHERE status = 'success') as successful,
  AVG(execution_time_ms) as avg_time_ms,
  SUM(tasks_created) as total_tasks_created
FROM sync_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY sync_type;
```

### Vérifier les jobs cron

```sql
-- Jobs actifs
SELECT * FROM cron.job WHERE jobname LIKE 'nexus-%';

-- Dernières exécutions
SELECT * FROM cron.job_run_details
WHERE jobid IN (SELECT jobid FROM cron.job WHERE jobname LIKE 'nexus-%')
ORDER BY start_time DESC
LIMIT 10;
```

---

## 🚀 Scalabilité

### Limites actuelles (Free Tier Supabase)

- **Edge Functions:** 500K invocations/mois
- **Database:** 500 MB storage
- **Cron:** Illimité (pg_cron natif)

**Consommation estimée:**
- Realtime sync: ~24 exécutions/jour × 30 jours = **720/mois** ✅
- Weekly sync: ~4 exécutions/mois ✅
- **Total:** ~724 invocations/mois (bien en dessous de 500K)

### Scaling vers Pro ($25/mois)

Si le volume augmente:
- Edge Functions: Illimité
- Database: 8 GB storage
- Plus de ressources CPU/RAM

---

## 🛡️ Sécurité

### Bonnes pratiques implémentées

- ✅ **Secrets** stockés dans Supabase Secrets (pas de .env committé)
- ✅ **Row Level Security (RLS)** activé sur les tables
- ✅ **Service Role** seulement pour Edge Functions
- ✅ **HTTPS** partout (Supabase + APIs externes)
- ✅ **Logs** ne contiennent pas de données sensibles

### Google Service Account

Le fichier `credentials.json` est:
- Généré via Google Cloud Console
- Converti en JSON string
- Stocké dans `GOOGLE_CREDENTIALS` (Supabase Secrets)
- **Jamais** commité dans Git

---

## 🔧 Troubleshooting

### Sync qui ne s'exécute pas

**1. Vérifier le cron:**
```sql
SELECT * FROM cron.job WHERE jobname = 'nexus-realtime-sync';
```

**2. Vérifier les dernières exécutions:**
```sql
SELECT * FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'nexus-realtime-sync')
ORDER BY start_time DESC LIMIT 1;
```

**3. Tester manuellement:**
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/nexus-realtime-sync \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Erreurs dans sync_logs

```sql
-- Voir les erreurs récentes
SELECT
  sync_type,
  error_message,
  created_at
FROM sync_logs
WHERE status = 'error'
ORDER BY created_at DESC
LIMIT 5;
```

### Tasks non créées dans Google Tasks

**Vérifier:**
1. `GOOGLE_CREDENTIALS` est bien configuré
2. Google Tasks API est activée dans Google Cloud
3. Service Account a les bonnes permissions
4. Logs de l'Edge Function pour détails

---

## 📚 Ressources

- **Supabase Docs:** https://supabase.com/docs
- **Deno Manual:** https://deno.land/manual
- **Limitless API:** https://limitless.ai/developers
- **Claude API:** https://docs.anthropic.com
- **Google Tasks API:** https://developers.google.com/tasks
- **Notion API:** https://developers.notion.com

---

**Dernière mise à jour:** 26 janvier 2025
