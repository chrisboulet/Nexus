-- ===========================================
-- NEXUS - Activation des Cron Jobs
-- ===========================================
-- À exécuter dans Supabase SQL Editor
-- Dashboard → SQL Editor → New Query

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ===========================================
-- 1. Realtime Sync: Every 30 minutes (7 AM - 7 PM EST)
-- ===========================================

SELECT cron.schedule(
  'nexus-realtime-sync',
  '0,30 12-23 * * *',  -- Every 30 minutes from 12:00 to 23:30 UTC (7 AM - 7 PM EST)
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

-- ===========================================
-- 2. Weekly CRM Sync: Every Friday at 2 PM EST
-- ===========================================

SELECT cron.schedule(
  'nexus-weekly-sync',
  '0 19 * * 5',  -- At 19:00 UTC every Friday (2 PM EST)
  $$
  SELECT
    net.http_post(
      url := 'https://llxgkvxqznibjnzninza.supabase.co/functions/v1/nexus-weekly-sync',
      headers := jsonb_build_object(
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxseGdrdnhxem5pYmpuem5pbnphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTE1MjYsImV4cCI6MjA3NzA4NzUyNn0.dVQ_FOAJ2t4J3czKqANebDoqj3USNzLG4Tz_wLUrE_E',
        'Content-Type', 'application/json'
      )
    ) AS request_id;
  $$
);

-- ===========================================
-- Vérifier les cron jobs créés
-- ===========================================

SELECT
  jobid,
  jobname,
  schedule,
  active,
  database
FROM cron.job
WHERE jobname LIKE 'nexus-%'
ORDER BY jobname;

-- ===========================================
-- Pour désactiver un job (si nécessaire)
-- ===========================================

-- SELECT cron.unschedule('nexus-realtime-sync');
-- SELECT cron.unschedule('nexus-weekly-sync');
