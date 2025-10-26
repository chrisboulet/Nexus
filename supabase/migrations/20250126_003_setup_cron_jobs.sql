-- Migration: Setup pg_cron jobs for NEXUS automation
-- Requires pg_cron extension (installed by default on Supabase)

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ===========================================
-- Realtime Sync: Every 30 minutes (7 AM - 7 PM EST)
-- ===========================================

-- EST = UTC-5, so 7 AM EST = 12:00 UTC, 7 PM EST = 00:00 UTC next day
-- Runs: 12:00, 12:30, 13:00, ..., 23:30 UTC (covers 7 AM - 7 PM EST)

SELECT cron.schedule(
  'nexus-realtime-sync',
  '0,30 12-23 * * *',  -- Every 30 minutes from 12:00 to 23:30 UTC
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/nexus-realtime-sync',
      headers := jsonb_build_object(
        'Authorization', 'Bearer YOUR_ANON_KEY',
        'Content-Type', 'application/json'
      )
    ) AS request_id;
  $$
);

-- ===========================================
-- Weekly CRM Sync: Every Friday at 2 PM EST
-- ===========================================

-- 2 PM EST = 19:00 UTC on Fridays (day 5)

SELECT cron.schedule(
  'nexus-weekly-sync',
  '0 19 * * 5',  -- At 19:00 UTC every Friday
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/nexus-weekly-sync',
      headers := jsonb_build_object(
        'Authorization', 'Bearer YOUR_ANON_KEY',
        'Content-Type', 'application/json'
      )
    ) AS request_id;
  $$
);

-- ===========================================
-- Optional: Cleanup Job
-- ===========================================

-- Run cleanup every Sunday at midnight EST (5:00 UTC)
SELECT cron.schedule(
  'nexus-cleanup',
  '0 5 * * 0',  -- At 05:00 UTC every Sunday
  $$
  SELECT cleanup_old_priorities();
  $$
);

-- ===========================================
-- View Scheduled Jobs
-- ===========================================

-- Query to see all NEXUS cron jobs:
-- SELECT * FROM cron.job WHERE jobname LIKE 'nexus-%';

-- ===========================================
-- Unschedule Jobs (if needed)
-- ===========================================

-- To remove jobs, run:
-- SELECT cron.unschedule('nexus-realtime-sync');
-- SELECT cron.unschedule('nexus-weekly-sync');
-- SELECT cron.unschedule('nexus-cleanup');

-- ===========================================
-- Important Notes
-- ===========================================

/*
BEFORE RUNNING THIS MIGRATION:

1. Replace YOUR_PROJECT_REF with your actual Supabase project reference
   Example: abcdefghijklmnop

2. Replace YOUR_ANON_KEY with your Supabase anon key
   Found in: Supabase Dashboard → Settings → API → anon public

3. Verify your Edge Functions are deployed:
   - nexus-realtime-sync
   - nexus-weekly-sync

4. Test cron jobs manually first:
   SELECT * FROM cron.job WHERE jobname LIKE 'nexus-%';

5. Monitor job execution:
   SELECT * FROM cron.job_run_details
   WHERE jobid IN (SELECT jobid FROM cron.job WHERE jobname LIKE 'nexus-%')
   ORDER BY start_time DESC
   LIMIT 10;
*/
