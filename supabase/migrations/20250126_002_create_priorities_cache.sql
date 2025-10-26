-- Migration: Create priorities_cache table
-- Cache detected priorities to avoid duplicates

CREATE TABLE IF NOT EXISTS public.priorities_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  priority_type TEXT NOT NULL CHECK (priority_type IN ('engagement', 'demande', 'deadline')),
  context TEXT CHECK (context IN ('@appels', '@ordi', '@agenda', '@attente', '@courses')),
  source_conversation TEXT NOT NULL,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for deduplication queries
CREATE INDEX idx_priorities_cache_title ON public.priorities_cache(title);
CREATE INDEX idx_priorities_cache_source ON public.priorities_cache(source_conversation);
CREATE INDEX idx_priorities_cache_created_at ON public.priorities_cache(created_at DESC);
CREATE INDEX idx_priorities_cache_processed ON public.priorities_cache(processed);

-- Composite index for deduplication lookup
CREATE UNIQUE INDEX idx_priorities_cache_dedup
  ON public.priorities_cache(title, source_conversation);

-- Add comment
COMMENT ON TABLE public.priorities_cache IS 'Cache of detected priorities to prevent duplicate task creation';

-- Enable Row Level Security
ALTER TABLE public.priorities_cache ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage priorities cache
CREATE POLICY "Service role can manage priorities_cache"
  ON public.priorities_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Auto-cleanup: Delete priorities older than 30 days (optional)
-- This keeps the cache from growing too large
CREATE OR REPLACE FUNCTION cleanup_old_priorities()
RETURNS void AS $$
BEGIN
  DELETE FROM public.priorities_cache
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Note: You can schedule this cleanup function via pg_cron if desired
