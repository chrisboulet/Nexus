# Guide de Déploiement NEXUS
## Supabase Edge Functions - Setup Complet

**Version:** 2.0
**Date:** 26 janvier 2025

---

## 📋 Vue d'Ensemble

Ce guide vous accompagne pas-à-pas pour déployer NEXUS sur Supabase et activer l'automatisation complète.

**Temps estimé:** 45-60 minutes

**Prérequis:**
- Compte Supabase (gratuit)
- Clés API (Limitless, Anthropic, Notion, Google)
- Git installé
- Node.js ou Deno installé

---

## 🎯 Étapes du Déploiement

### Phase 1: Préparation des Clés API (15 min)

#### 1.1 Limitless API

1. Aller sur https://limitless.ai/developers
2. Se connecter à votre compte Limitless
3. Générer une API key
4. **Copier** `lim_xxxxxxxxxxxx`

#### 1.2 Anthropic Claude

1. Aller sur https://console.anthropic.com/
2. Créer un compte ou se connecter
3. Settings → API Keys
4. Créer une nouvelle clé
5. **Copier** `sk-ant-xxxxxxxxxxxx`

#### 1.3 Notion

1. Aller sur https://www.notion.so/my-integrations
2. Créer une nouvelle integration
3. Nommer: "NEXUS Integration"
4. Capabilities: Read content, Update content, Insert content
5. **Copier** le Integration Token `secret_xxxxxxxxxxxx`
6. **Note:** Votre Workspace ID: `a8803c33-4e63-816d-a693-0003102f3eb9`

**Optionnel - Configurer databases Notion:**
- Créer 3 databases: Leads, Clients, Projects
- Partager chaque database avec l'integration NEXUS
- Noter les database IDs

#### 1.4 Google Tasks API

**C'est l'étape la plus technique:**

1. Aller sur https://console.cloud.google.com
2. Créer un nouveau projet: "NEXUS"
3. Activer Google Tasks API:
   - APIs & Services → Library
   - Chercher "Google Tasks API"
   - Cliquer "Enable"
4. Créer un Service Account:
   - APIs & Services → Credentials
   - Create Credentials → Service Account
   - Nom: "nexus-service-account"
   - Rôle: Basic → Editor (ou Owner)
5. Créer une clé:
   - Cliquer sur le service account créé
   - Keys → Add Key → Create new key
   - Type: JSON
   - **Télécharger** le fichier `credentials.json`
6. **Important:** Garder ce fichier précieusement!

---

### Phase 2: Setup Supabase (10 min)

#### 2.1 Créer Projet Supabase

1. Aller sur https://supabase.com
2. New Project
3. Nom: "nexus-boulet-strategies"
4. Database Password: (générer un mot de passe fort)
5. Région: **East US** (proche Québec)
6. Plan: **Free**
7. Create Project (attendre 2-3 minutes)

#### 2.2 Noter les Credentials

Une fois le projet créé:

1. Settings → API
2. Noter:
   - **Project URL:** `https://[your-ref].supabase.co`
   - **anon public key:** `eyJxxx...`
   - **service_role key:** `eyJxxx...` (secret!)

#### 2.3 Installer Supabase CLI

**macOS:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```powershell
scoop install supabase
```

**Linux:**
```bash
brew install supabase/tap/supabase
```

**Vérifier:**
```bash
supabase --version
```

---

### Phase 3: Configuration Locale (10 min)

#### 3.1 Cloner le Repo

```bash
git clone https://github.com/chrisboulet/Nexus.git
cd Nexus
```

#### 3.2 Configurer .env Local

```bash
cp .env.example .env
```

Éditer `.env`:

```bash
# Supabase
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=eyJxxx... (anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... (service role key)

# Limitless
LIMITLESS_API_KEY=lim_xxxxxxxxxxxx
LIMITLESS_ENDPOINT=https://api.limitless.ai/v1

# Anthropic
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
ANTHROPIC_MODEL=claude-sonnet-4-5-20250929

# Notion
NOTION_TOKEN=secret_xxxxxxxxxxxx
NOTION_WORKSPACE_ID=a8803c33-4e63-816d-a693-0003102f3eb9

# Google Tasks
# IMPORTANT: Ouvrir credentials.json téléchargé et copier TOUT le JSON sur une seule ligne
GOOGLE_CREDENTIALS={"type":"service_account","project_id":"nexus-xxxxx",...}
```

**💡 Astuce Google Credentials:**

Option 1 (manuel):
```bash
# Copier le contenu de credentials.json et enlever les sauts de ligne
cat credentials.json | tr -d '\n'
```

Option 2 (Node.js):
```bash
node -e "console.log(JSON.stringify(require('./credentials.json')))"
```

#### 3.3 Lier à Supabase

```bash
supabase login  # Suivre les instructions

supabase link --project-ref YOUR_PROJECT_REF
# Entrer le database password créé en 2.1
```

---

### Phase 4: Déploiement Database (5 min)

#### 4.1 Appliquer les Migrations

```bash
supabase db push
```

Ceci crée:
- Table `sync_logs`
- Table `priorities_cache`
- pg_cron jobs (désactivés pour l'instant)

**Vérifier:**

```sql
-- Dans Supabase Dashboard → SQL Editor
SELECT * FROM sync_logs;
SELECT * FROM priorities_cache;
SELECT * FROM cron.job;
```

---

### Phase 5: Déploiement Edge Functions (10 min)

#### 5.1 Configurer les Secrets Supabase

**Important:** Les Edge Functions ne lisent PAS le fichier `.env` - il faut configurer les secrets via Dashboard.

1. Supabase Dashboard → Settings → Edge Functions
2. Cliquer "Add secret" pour chaque variable:

| Secret Name | Valeur |
|-------------|---------|
| `LIMITLESS_API_KEY` | `lim_xxxxxxxxxxxx` |
| `LIMITLESS_ENDPOINT` | `https://api.limitless.ai/v1` |
| `ANTHROPIC_API_KEY` | `sk-ant-xxxxxxxxxxxx` |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-5-20250929` |
| `NOTION_TOKEN` | `secret_xxxxxxxxxxxx` |
| `NOTION_WORKSPACE_ID` | `a8803c33-4e63-816d-a693-0003102f3eb9` |
| `GOOGLE_CREDENTIALS` | (JSON stringifié) |
| `SUPABASE_URL` | `https://YOUR_REF.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJxxx...` |

**Optional (databases Notion):**
- `NOTION_LEADS_DATABASE_ID`
- `NOTION_CLIENTS_DATABASE_ID`
- `NOTION_PROJECTS_DATABASE_ID`

#### 5.2 Déployer les Functions

```bash
# Installer Deno si pas déjà fait
curl -fsSL https://deno.land/install.sh | sh

# Deploy toutes les functions
deno task deploy

# Ou individuellement:
supabase functions deploy nexus-realtime-sync
supabase functions deploy nexus-weekly-sync
```

**Vérifier le déploiement:**

Supabase Dashboard → Edge Functions

Vous devriez voir:
- `nexus-realtime-sync` (deployed)
- `nexus-weekly-sync` (deployed)

---

### Phase 6: Activation des Cron Jobs (5 min)

#### 6.1 Modifier la Migration Cron

Ouvrir `supabase/migrations/20250126_003_setup_cron_jobs.sql`

**Remplacer:**
- `YOUR_PROJECT_REF` par votre ref Supabase
- `YOUR_ANON_KEY` par votre anon key

**Exemple:**
```sql
SELECT cron.schedule(
  'nexus-realtime-sync',
  '0,30 12-23 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://abcdefghij.supabase.co/functions/v1/nexus-realtime-sync',
      headers := jsonb_build_object(
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        'Content-Type', 'application/json'
      )
    ) AS request_id;
  $$
);
```

#### 6.2 Exécuter la Migration Cron

```bash
# Depuis Supabase Dashboard → SQL Editor
# Copier-coller le contenu modifié de 20250126_003_setup_cron_jobs.sql
# Exécuter
```

**Vérifier:**

```sql
SELECT * FROM cron.job WHERE jobname LIKE 'nexus-%';
```

Vous devriez voir:
- `nexus-realtime-sync` (actif)
- `nexus-weekly-sync` (actif)

---

### Phase 7: Tests (10 min)

#### 7.1 Test Manuel Realtime Sync

```bash
curl -X POST https://YOUR_REF.supabase.co/functions/v1/nexus-realtime-sync \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

**Résultat attendu:**
```json
{
  "success": true,
  "conversationsAnalyzed": 0,
  "prioritiesDetected": 0,
  "tasksCreated": 0
}
```

(0 si aucune conversation récente)

#### 7.2 Vérifier les Logs

```sql
SELECT * FROM sync_logs ORDER BY created_at DESC LIMIT 1;
```

Devrait afficher une entrée avec `status = 'success'`

#### 7.3 Test avec Vraie Conversation

1. Avoir une conversation enregistrée dans Limitless
2. Mentionner un engagement explicite: "Je vais t'envoyer un email cette semaine"
3. Attendre 30 minutes (ou déclencher manuellement)
4. Ouvrir Google Tasks → Voir la tâche créée!

---

### Phase 8: Vérifications Finales (5 min)

#### 8.1 Checklist Complète

- [ ] Supabase projet créé
- [ ] Toutes les variables d'environnement configurées dans Secrets
- [ ] Migrations appliquées (sync_logs, priorities_cache)
- [ ] Edge Functions déployées (2/2)
- [ ] Cron jobs activés (2/2)
- [ ] Test manuel réussi
- [ ] Google Tasks connecté
- [ ] Notion workspace accessible

#### 8.2 Dashboard Monitoring

**Créer un bookmark:**
- Supabase SQL Editor avec cette query:

```sql
-- Vue d'ensemble des derniers syncs
SELECT
  sync_type,
  status,
  priorities_found,
  tasks_created,
  execution_time_ms,
  created_at
FROM sync_logs
ORDER BY created_at DESC
LIMIT 20;
```

---

## 🎉 Félicitations!

**NEXUS est maintenant 100% automatisé!**

### Ce qui se passe maintenant:

**Toutes les 30 minutes (7h AM - 7h PM):**
- NEXUS analyse vos conversations Limitless
- Crée automatiquement les tasks dans Google Tasks
- Logs tout dans Supabase

**Chaque vendredi 14h:**
- NEXUS met à jour votre CRM Notion
- Identifie nouveaux leads
- Track les projets

**Vous n'avez plus rien à faire!** ✨

---

## 🔧 Maintenance

### Logs Quotidiens

Vérifier les erreurs:
```sql
SELECT * FROM sync_logs
WHERE status = 'error'
ORDER BY created_at DESC;
```

### Stats Hebdomadaires

```sql
SELECT
  sync_type,
  COUNT(*) as executions,
  AVG(execution_time_ms) as avg_time,
  SUM(tasks_created) as total_tasks
FROM sync_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY sync_type;
```

### Nettoyage Cache (optionnel)

```sql
-- Supprimer priorités > 30 jours
DELETE FROM priorities_cache
WHERE created_at < NOW() - INTERVAL '30 days';
```

---

## 🚨 Troubleshooting

### Problème: Cron ne s'exécute pas

**Solution:**
1. Vérifier que l'URL et l'anon key sont corrects dans la migration cron
2. Vérifier les logs cron:
```sql
SELECT * FROM cron.job_run_details
WHERE jobid IN (SELECT jobid FROM cron.job WHERE jobname LIKE 'nexus-%')
ORDER BY start_time DESC;
```

### Problème: Tasks non créées dans Google Tasks

**Solutions:**
1. Vérifier `GOOGLE_CREDENTIALS` dans Secrets
2. Vérifier que Google Tasks API est activée
3. Tester manuellement la function
4. Consulter les logs Edge Function dans Supabase Dashboard

### Problème: Erreur "Invalid API Key"

**Vérifier:**
- Les secrets sont bien configurés dans Edge Functions Secrets
- Pas d'espaces avant/après les clés
- Les clés sont valides et actives

---

## 📚 Ressources

- **Supabase Docs:** https://supabase.com/docs
- **Edge Functions Guide:** https://supabase.com/docs/guides/functions
- **pg_cron Docs:** https://github.com/citusdata/pg_cron
- **Architecture NEXUS:** [docs/Architecture.md](Architecture.md)

---

## 🎓 Prochaines Étapes

Maintenant que NEXUS est déployé:

1. **Semaine 1-2:** Observer et valider
   - Vérifier que les syncs s'exécutent
   - Valider la qualité des détections Claude
   - Ajuster les prompts si nécessaire

2. **Semaine 3-4:** Optimiser
   - Affiner les contextes (@appels, @ordi)
   - Configurer les databases Notion CRM
   - Créer dashboards personnalisés

3. **Mois 2+:** Améliorer
   - Ajouter notifications (Slack/Email)
   - Implémenter lead scoring
   - Intégrer Google Calendar

---

**Déploiement complété! 🚀**

**Dernière mise à jour:** 26 janvier 2025
