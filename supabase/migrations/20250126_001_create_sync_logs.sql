-- Migration: Create sync_logs table
-- Track all sync executions (realtime, daily, weekly)

CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL CHECK (sync_type IN ('realtime', 'daily', 'weekly')),
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'partial')),
  priorities_found INTEGER DEFAULT 0,
  tasks_created INTEGER DEFAULT 0,
  error_message TEXT,
  execution_time_ms INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_sync_logs_created_at ON public.sync_logs(created_at DESC);
CREATE INDEX idx_sync_logs_sync_type ON public.sync_logs(sync_type);
CREATE INDEX idx_sync_logs_status ON public.sync_logs(status);

-- Add comment
COMMENT ON TABLE public.sync_logs IS 'Logs of NEXUS sync executions for monitoring and debugging';

-- Enable Row Level Security (optional, if needed)
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage sync logs
CREATE POLICY "Service role can manage sync_logs"
  ON public.sync_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
