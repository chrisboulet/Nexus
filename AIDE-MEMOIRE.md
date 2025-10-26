# NEXUS - Aide-Mémoire

Guide de référence rapide pour gérer votre système NEXUS automatisé.

---

## 🔗 URLs Importantes

| Service | URL | Notes |
|---------|-----|-------|
| **Supabase Dashboard** | https://supabase.com/dashboard/project/llxgkvxqznibjnzninza | Gestion du projet |
| **SQL Editor** | https://supabase.com/dashboard/project/llxgkvxqznibjnzninza/sql/new | Exécuter des requêtes SQL |
| **Edge Functions** | https://supabase.com/dashboard/project/llxgkvxqznibjnzninza/functions | Logs et déploiements |
| **Secrets** | https://supabase.com/dashboard/project/llxgkvxqznibjnzninza/settings/functions | Variables d'environnement |
| **Notion Workspace** | https://notion.so/a8803c33-4e63-816d-a693-0003102f3eb9 | CRM Boulet Stratégies TI |
| **Limitless Developers** | https://limitless.ai/developers | API keys et docs |

---

## 🚀 Commandes Essentielles

### Déploiement des Edge Functions

```powershell
cd E:\PERSO\nexus

# Déployer toutes les fonctions
supabase functions deploy nexus-realtime-sync
supabase functions deploy nexus-weekly-sync

# Déployer une seule fonction
supabase functions deploy nexus-realtime-sync
```

### Test Manuel des Fonctions

```powershell
# Test de synchronisation temps réel
curl -X POST "https://llxgkvxqznibjnzninza.supabase.co/functions/v1/nexus-realtime-sync" `
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxseGdrdnhxem5pYmpuem5pbnphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTE1MjYsImV4cCI6MjA3NzA4NzUyNn0.dVQ_FOAJ2t4J3czKqANebDoqj3USNzLG4Tz_wLUrE_E" `
  -H "Content-Type: application/json"

# Test de synchronisation hebdomadaire CRM
curl -X POST "https://llxgkvxqznibjnzninza.supabase.co/functions/v1/nexus-weekly-sync" `
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxseGdrdnhxem5pYmpuem5pbnphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTE1MjYsImV4cCI6MjA3NzA4NzUyNn0.dVQ_FOAJ2t4J3czKqANebDoqj3USNzLG4Tz_wLUrE_E" `
  -H "Content-Type: application/json"
```

### Git & Commits

```powershell
cd E:\PERSO\nexus

# Commit et push des changements
git add .
git commit -m "Description du changement"
git push

# Voir le statut
git status

# Voir l'historique
git log --oneline -10
```

---

## 📊 Requêtes SQL Utiles

### Monitoring

```sql
-- Voir les dernières synchronisations
SELECT
  sync_type,
  status,
  priorities_found,
  tasks_created,
  execution_time_ms,
  error_message,
  created_at AT TIME ZONE 'America/Toronto' as created_at_est
FROM sync_logs
ORDER BY created_at DESC
LIMIT 10;

-- Statistiques des dernières 24h
SELECT
  sync_type,
  COUNT(*) as total_syncs,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success_count,
  SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error_count,
  SUM(priorities_found) as total_priorities,
  SUM(tasks_created) as total_tasks
FROM sync_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY sync_type;

-- Voir les erreurs récentes
SELECT
  sync_type,
  error_message,
  created_at AT TIME ZONE 'America/Toronto' as created_at_est
FROM sync_logs
WHERE status = 'error'
ORDER BY created_at DESC
LIMIT 5;
```

### Gestion du Cache de Priorités

```sql
-- Voir les priorités récentes en cache
SELECT
  title,
  priority_type,
  context,
  confidence,
  source_conversation,
  created_at AT TIME ZONE 'America/Toronto' as created_at_est
FROM priorities_cache
ORDER BY created_at DESC
LIMIT 20;

-- Nettoyer le cache (priorités de plus de 30 jours)
DELETE FROM priorities_cache
WHERE created_at < NOW() - INTERVAL '30 days';

-- Vider complètement le cache (⚠️ Attention!)
DELETE FROM priorities_cache;
```

### Gestion des Cron Jobs

```sql
-- Voir tous les cron jobs NEXUS
SELECT
  jobid,
  jobname,
  schedule,
  active,
  database
FROM cron.job
WHERE jobname LIKE 'nexus-%'
ORDER BY jobname;

-- Voir l'historique d'exécution des cron jobs
SELECT
  j.jobname,
  r.status,
  r.start_time AT TIME ZONE 'America/Toronto' as start_time_est,
  r.end_time AT TIME ZONE 'America/Toronto' as end_time_est,
  r.return_message
FROM cron.job_run_details r
JOIN cron.job j ON j.jobid = r.jobid
WHERE j.jobname LIKE 'nexus-%'
ORDER BY r.start_time DESC
LIMIT 20;

-- Désactiver un cron job
SELECT cron.unschedule('nexus-realtime-sync');

-- Réactiver un cron job (recréer)
SELECT cron.schedule(
  'nexus-realtime-sync',
  '0,30 12-23 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://llxgkvxqznibjnzninza.supabase.co/functions/v1/nexus-realtime-sync',
      headers := jsonb_build_object(
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxseGdrdnhxem5pYmpuem5pbnphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTE1MjYsImV4cCI6MjA3NzA4NzUyNn0.dVQ_FOAJ2t4J3czKqANebDoqj3USNzLG4Tz_wLUrE_E',
        'Content-Type', 'application/json'
      )
    ) AS request_id;
  $$
);
```

---

## ⚙️ Configuration des Secrets

Les 7 secrets à configurer dans **Settings → Functions**:

| Secret | Valeur | Obtenir |
|--------|--------|---------|
| `LIMITLESS_API_KEY` | `lim_xxxxx...` | https://limitless.ai/developers |
| `LIMITLESS_ENDPOINT` | `https://api.limitless.ai/v1` | Fixe |
| `ANTHROPIC_API_KEY` | `sk-ant-xxxxx...` | https://console.anthropic.com/ |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-5-20250929` | Fixe |
| `NOTION_TOKEN` | `secret_xxxxx...` | https://www.notion.so/my-integrations |
| `NOTION_WORKSPACE_ID` | `a8803c33-4e63-816d-a693-0003102f3eb9` | Votre workspace |
| `GOOGLE_CREDENTIALS` | `{"type":"service_account",...}` | Google Cloud Console |

**⚠️ Important:** Après modification d'un secret, redéployez les fonctions!

---

## 🕐 Horaires de Synchronisation

| Job | Horaire (EST) | Horaire (UTC) | Fréquence |
|-----|---------------|---------------|-----------|
| **Realtime Sync** | 7h00 AM - 7h30 PM | 12:00 - 00:30 | Toutes les 30 min |
| **Weekly CRM Sync** | Vendredi 14h00 | Vendredi 19:00 | 1x semaine |

**Note:** EST = UTC-5 (hiver) ou UTC-4 (été avec DST)

---

## 🐛 Dépannage

### La fonction retourne une erreur

1. **Vérifier les logs Edge Functions:**
   - Dashboard → Functions → nexus-realtime-sync → Logs

2. **Vérifier les secrets:**
   - Dashboard → Settings → Functions
   - Tous les 7 secrets doivent être configurés

3. **Redéployer après changement:**
   ```powershell
   supabase functions deploy nexus-realtime-sync
   ```

### Les cron jobs ne s'exécutent pas

1. **Vérifier qu'ils sont actifs:**
   ```sql
   SELECT jobname, active FROM cron.job WHERE jobname LIKE 'nexus-%';
   ```

2. **Vérifier l'historique d'exécution:**
   ```sql
   SELECT j.jobname, r.status, r.return_message
   FROM cron.job_run_details r
   JOIN cron.job j ON j.jobid = r.jobid
   WHERE j.jobname LIKE 'nexus-%'
   ORDER BY r.start_time DESC LIMIT 5;
   ```

3. **Recréer le cron job:**
   - Voir section "Gestion des Cron Jobs" ci-dessus

### Aucune priorité détectée

1. **Vérifier qu'il y a des conversations Limitless:**
   - Tester manuellement: curl (voir section "Test Manuel")

2. **Vérifier la clé API Limitless:**
   ```powershell
   curl -X GET "https://api.limitless.ai/v1/lifelogs?limit=1" `
     -H "X-API-Key: VOTRE_CLE_LIMITLESS"
   ```

3. **Analyser les logs de sync:**
   ```sql
   SELECT error_message FROM sync_logs
   WHERE status = 'error'
   ORDER BY created_at DESC LIMIT 1;
   ```

### Duplications de tâches dans Google Tasks

1. **Vider le cache de priorités:**
   ```sql
   DELETE FROM priorities_cache;
   ```

2. **Vérifier la déduplication:**
   ```sql
   SELECT title, COUNT(*)
   FROM priorities_cache
   GROUP BY title
   HAVING COUNT(*) > 1;
   ```

---

## 📝 Workflow Quotidien

### Matin (5 minutes)

1. ☕ Ouvrir Google Tasks (liste "NEXUS - Priorités")
2. 📋 Réviser les priorités du jour
3. 🎯 Identifier les 2-3 tâches critiques
4. ⏰ Planifier les plages horaires dans agenda

### Pendant la journée

1. 🎙️ Parler naturellement avec Limitless
2. 🤝 Prendre des engagements et recevoir des demandes
3. ⏰ NEXUS synchronise automatiquement aux 30 minutes
4. ✅ Les tâches apparaissent dans Google Tasks

### Vendredi après-midi

1. 📊 Vérifier la sync CRM hebdomadaire (14h EST)
2. 👥 Réviser les nouveaux leads dans Notion
3. 🔄 Mettre à jour les statuts clients si nécessaire

---

## 🔄 Mise à Jour de NEXUS

### Modifier le code

```powershell
cd E:\PERSO\nexus

# 1. Modifier les fichiers nécessaires
code supabase/functions/...

# 2. Tester localement (optionnel)
supabase functions serve

# 3. Commiter les changements
git add .
git commit -m "Description du changement"
git push

# 4. Redéployer les fonctions
supabase functions deploy nexus-realtime-sync
supabase functions deploy nexus-weekly-sync
```

### Ajouter/modifier une migration SQL

```powershell
# Créer une nouvelle migration
supabase migration new nom_de_la_migration

# Éditer le fichier créé
code supabase/migrations/YYYYMMDDHHMMSS_nom_de_la_migration.sql

# Appliquer à la base de données
supabase db push
```

---

## 📞 Support & Ressources

- **Documentation Supabase:** https://supabase.com/docs
- **Documentation Limitless API:** https://limitless.ai/developers
- **Documentation Claude API:** https://docs.anthropic.com/
- **Code source NEXUS:** E:\PERSO\nexus

---

## ⚡ Commandes Rapides

```powershell
# Test complet du système
curl -X POST "https://llxgkvxqznibjnzninza.supabase.co/functions/v1/nexus-realtime-sync" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxseGdrdnhxem5pYmpuem5pbnphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTE1MjYsImV4cCI6MjA3NzA4NzUyNn0.dVQ_FOAJ2t4J3czKqANebDoqj3USNzLG4Tz_wLUrE_E" -H "Content-Type: application/json"

# Redéployer tout
supabase functions deploy nexus-realtime-sync; supabase functions deploy nexus-weekly-sync

# Commit rapide
git add . && git commit -m "update" && git push
```

---

**Version:** 1.0
**Dernière mise à jour:** 2025-10-26
**Projet:** NEXUS - Boulet Stratégies TI
