# 🎯 NEXUS

**AI-Powered Priority Assistant - Supabase Edition**
Strategic Coordination & Unified Tracking for Boulet Stratégies TI

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com)
[![Deno](https://img.shields.io/badge/Deno-000000?style=flat&logo=deno&logoColor=white)](https://deno.land)

---

## 🌟 Vision

En tant que fractional CTO solo, Christian jongle entre multiples conversations prospects/clients enregistrées dans Limitless.

**NEXUS analyse automatiquement ces conversations toutes les 30 minutes, extrait les priorités, et les transforme en actions concrètes dans Google Tasks.**

Plus besoin de prendre des notes. Plus besoin de revues quotidiennes. Plus besoin de se rappeler ce que vous avez promis.

**Vous parlez. NEXUS s'occupe du reste.** ✨

---

## ⚡ Fonctionnalités

### 🔄 Sync Temps Réel (Automatique)

**Toutes les 30 minutes (7h AM - 7h PM):**
- Analyse vos conversations Limitless récentes
- Détecte automatiquement:
  - ✅ **Engagements pris**: "je vais te revenir avec une proposition"
  - ✅ **Demandes reçues**: "peux-tu m'envoyer ton CV?"
  - ✅ **Deadlines**: "il me faut ça avant vendredi"
- Crée les tasks dans Google Tasks automatiquement
- Élimine les duplicatas intelligemment

### 📊 CRM Hebdomadaire (Automatique)

**Chaque vendredi 14h:**
- Analyse toutes les conversations de la semaine
- Identifie nouveaux leads/prospects
- Met à jour le CRM Notion automatiquement
- Track les projets et mandats mentionnés

### 🤖 Powered by Claude Sonnet 4.5

Analyse IA via Anthropic Claude pour une précision > 90%

---

## 🏗️ Architecture

```
Limitless AI (conversations)
    ↓ (toutes les 30 min)
Supabase Edge Functions (TypeScript/Deno)
    ├─ Claude Analysis
    ├─ Deduplication
    └─ Smart Context Detection
    ↓
Google Tasks (vos priorités du jour)
    +
Notion CRM (votre vision stratégique)
```

**Stack:**
- **Runtime:** Deno (TypeScript)
- **Cloud:** Supabase (Free Tier = $0/mois!)
- **Cron:** pg_cron (natif PostgreSQL)
- **APIs:** Limitless, Anthropic, Google Tasks, Notion

---

## 🚀 Quickstart

### Prérequis

1. Compte Supabase (gratuit): https://supabase.com
2. API Keys:
   - Limitless: https://limitless.ai/developers
   - Anthropic: https://console.anthropic.com
   - Notion: https://www.notion.so/my-integrations
   - Google Cloud (Service Account pour Tasks API)

### Installation Locale

```bash
# Clone repo
git clone https://github.com/chrisboulet/Nexus.git
cd Nexus

# Install Supabase CLI
brew install supabase/tap/supabase  # macOS
# ou: https://supabase.com/docs/guides/cli

# Start local Supabase
supabase start

# Configure .env
cp .env.example .env
# Éditer .env avec vos clés API
```

### Déploiement Production

**Voir [docs/Deployment.md](docs/Deployment.md) pour le guide complet.**

Quick steps:
```bash
# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy Edge Functions
deno task deploy

# Run migrations
supabase db push

# Configure secrets via Dashboard
# Supabase Dashboard → Settings → Edge Functions → Secrets
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [**Architecture.md**](docs/Architecture.md) | Architecture technique détaillée |
| [**Workflow_Quotidien_v2.md**](docs/Workflow_Quotidien_v2.md) | Guide utilisateur quotidien |
| [**Deployment.md**](docs/Deployment.md) | Guide de déploiement pas-à-pas |
| [**Blueprint.md**](Blueprint.md) | Vision et roadmap originales |

---

## 📊 Exemple de Résultat

### Votre Matinée Type

```
9h00   📞 Appel avec Marc Veilleux (ESI)
       "Je te reviens avec une proposition cette semaine"

9h30   🤖 NEXUS analyse automatiquement

9h40   📱 Vous ouvrez Google Tasks:

       📋 NEXUS - Priorités

       💻 Préparer proposition Fractional CTO pour Marc Veilleux (ESI) [1h]
          Source: Conversation du 26 janvier 9h00
          Deadline: Cette semaine
          Contexte: @ordi

       ✨ La tâche est déjà créée!
```

### Votre Vendredi PM

```
14h00  🤖 NEXUS Weekly Sync (automatique)

14h15  📖 Vous ouvrez Notion CRM:

       Database: Leads
       ┌─────────────────┬────────────────┬─────────┬──────────────────┐
       │ Nom             │ Entreprise     │ Statut  │ Prochaine action │
       ├─────────────────┼────────────────┼─────────┼──────────────────┤
       │ Marc Veilleux   │ ESI Tech       │ 🔥 Chaud │ Envoyer proposal │
       │ Guy Tremblay    │ InnovIA        │ 🟡 Tiède │ Case studies IA  │
       └─────────────────┴────────────────┴─────────┴──────────────────┘

       ✨ Mis à jour automatiquement!
```

---

## 🎯 Workflow Quotidien

**Votre nouvelle routine (5 minutes!):**

1. **Matin:** Ouvrir Google Tasks → Voir vos priorités
2. **Journée:** Avoir des conversations (Limitless enregistre)
3. **C'est tout!** NEXUS fait le reste automatiquement

**Plus besoin de:**
- ❌ Prendre des notes manuelles
- ❌ Copier-coller entre outils
- ❌ Faire des revues quotidiennes
- ❌ Relire vos lifelogs

---

## 🗂️ Structure du Projet

```
nexus/
├── supabase/
│   ├── functions/
│   │   ├── _shared/              # Code partagé
│   │   │   ├── clients/          # API clients (Limitless, Claude, Google, Notion)
│   │   │   ├── types/            # TypeScript definitions
│   │   │   └── utils/            # Logger, Supabase helper
│   │   ├── nexus-realtime-sync/  # Sync temps réel (30 min)
│   │   └── nexus-weekly-sync/    # Sync CRM (vendredi)
│   ├── migrations/               # SQL migrations
│   └── config.toml               # Supabase config
├── docs/
│   ├── Architecture.md           # Architecture technique
│   ├── Workflow_Quotidien_v2.md  # Guide utilisateur
│   └── Deployment.md             # Guide déploiement
├── deno.json                     # Deno tasks & deps
├── .env.example                  # Template variables
└── README.md                     # (ce fichier)
```

---

## 🔐 Sécurité

- ✅ Tous les secrets dans Supabase Secrets (pas de .env commité)
- ✅ Row Level Security (RLS) activé
- ✅ Service Role seulement pour Edge Functions
- ✅ HTTPS partout
- ✅ Logs ne contiennent pas de données sensibles

---

## 📈 Monitoring

### Logs via Supabase Dashboard

```sql
-- Dernières 10 exécutions
SELECT
  sync_type,
  status,
  tasks_created,
  execution_time_ms,
  created_at
FROM sync_logs
ORDER BY created_at DESC
LIMIT 10;
```

### Stats Hebdomadaires

```sql
-- Performance derniers 7 jours
SELECT
  sync_type,
  COUNT(*) as total_runs,
  AVG(execution_time_ms) as avg_time_ms,
  SUM(tasks_created) as total_tasks
FROM sync_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY sync_type;
```

---

## 💰 Coûts

**Free Tier Supabase (largement suffisant):**
- Edge Functions: 500K invocations/mois
- Database: 500 MB storage
- Cron: Illimité (natif PostgreSQL)

**Consommation estimée:**
- Realtime sync: ~24/jour × 30 = 720/mois
- Weekly sync: 4/mois
- **Total:** ~724 invocations/mois

**Conclusion:** Gratuit pour toujours! 🎉

---

## 🛠️ Développement

### Lancer localement

```bash
# Start Supabase local
supabase start

# Serve Edge Functions
deno task dev

# Test function
curl -X POST http://localhost:54321/functions/v1/nexus-realtime-sync \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Déployer

```bash
# Deploy all functions
deno task deploy

# Deploy specific function
deno task deploy:daily
```

---

## 🗺️ Roadmap

### ✅ Phase 1: MVP Automatisé (Actuel)
- [x] Sync temps réel (30 min)
- [x] Analyse Claude
- [x] Google Tasks integration
- [x] Notion CRM hebdo
- [x] Déduplication intelligente

### 🚀 Phase 2: Améliorations (Q1 2025)
- [ ] Google Calendar auto-blocking
- [ ] Email summaries quotidiens
- [ ] Mobile notifications (via Slack/Discord)
- [ ] Analytics dashboard

### 🔮 Phase 3: Intelligence Avancée (Q2 2025)
- [ ] Prioritization automatique (importance + urgence)
- [ ] Lead scoring AI
- [ ] Recommandations proactives
- [ ] Intégration CRM avancée (Pipedrive, HubSpot)

---

## 🤝 Contribuer

Ce projet est **privé** et spécifique à Boulet Stratégies TI.

Pour des bugs ou améliorations:
1. Créer une issue dans GitHub
2. Ou contacter christian@bouletstrategies.ca

---

## 📝 License

MIT License - Voir [LICENSE](LICENSE)

---

## 👤 Auteur

**Christian Boulet**
Fractional CTO - Boulet Stratégies TI

- Email: christian@bouletstrategies.ca
- GitHub: [@chrisboulet](https://github.com/chrisboulet)
- LinkedIn: [Christian Boulet](https://linkedin.com/in/christianboulet)

---

## 🙏 Remerciements

Construit avec:
- [Supabase](https://supabase.com) - Backend as a Service
- [Deno](https://deno.land) - TypeScript runtime
- [Limitless AI](https://limitless.ai) - Conversation capture
- [Anthropic Claude](https://anthropic.com) - AI analysis
- [Google Tasks](https://developers.google.com/tasks) - Task management
- [Notion](https://notion.so) - CRM & Knowledge base

---

**🚀 Built with Claude Code**

*Version 2.0 - Supabase Serverless Edition*

**Dernière mise à jour:** 26 janvier 2025
