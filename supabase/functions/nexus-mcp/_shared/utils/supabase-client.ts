/**
 * Supabase Client Helper
 * Database operations for sync logs and priority cache
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { SyncLog, PriorityCache } from '../types/index.ts';

export class NexusSupabaseClient {
  private client: SupabaseClient;

  constructor(url?: string, serviceKey?: string) {
    const supabaseUrl = url || Deno.env.get('SUPABASE_URL');
    const supabaseKey = serviceKey || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuration error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
    }

    this.client = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Log a sync execution
   */
  async logSync(log: Omit<SyncLog, 'id' | 'createdAt'>): Promise<SyncLog | null> {
    try {
      const { data, error } = await this.client
        .from('sync_logs')
        .insert({
          sync_type: log.syncType,
          status: log.status,
          priorities_found: log.prioritiesFound,
          tasks_created: log.tasksCreated,
          error_message: log.errorMessage,
          execution_time_ms: log.executionTimeMs,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[Supabase] Failed to log sync:', error);
      return null;
    }
  }

  /**
   * Get timestamp of last successful sync
   */
  async getLastSyncTime(syncType: string = 'realtime'): Promise<Date | null> {
    try {
      const { data, error } = await this.client
        .from('sync_logs')
        .select('created_at')
        .eq('sync_type', syncType)
        .eq('status', 'success')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;
      return new Date(data.created_at);
    } catch {
      return null;
    }
  }

  /**
   * Cache a priority to avoid duplicates
   */
  async cachePriority(
    priority: Omit<PriorityCache, 'id' | 'createdAt' | 'processed'>
  ): Promise<PriorityCache | null> {
    try {
      const { data, error } = await this.client
        .from('priorities_cache')
        .insert({
          title: priority.title,
          priority_type: priority.priorityType,
          context: priority.context,
          source_conversation: priority.sourceConversation,
          confidence: priority.confidence,
          processed: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[Supabase] Failed to cache priority:', error);
      return null;
    }
  }

  /**
   * Check if a priority already exists (deduplication)
   */
  async priorityExists(title: string, source: string): Promise<boolean> {
    try {
      const { data, error } = await this.client
        .from('priorities_cache')
        .select('id')
        .eq('title', title)
        .eq('source_conversation', source)
        .limit(1);

      if (error) return false;
      return (data?.length || 0) > 0;
    } catch {
      return false;
    }
  }

  /**
   * Mark priorities as processed
   */
  async markPrioritiesProcessed(priorityIds: string[]): Promise<void> {
    try {
      await this.client
        .from('priorities_cache')
        .update({ processed: true })
        .in('id', priorityIds);
    } catch (error) {
      console.error('[Supabase] Failed to mark priorities as processed:', error);
    }
  }

  /**
   * Get sync stats for a time period
   */
  async getSyncStats(days: number = 7): Promise<{
    total: number;
    successful: number;
    failed: number;
    avgExecutionTime: number;
  }> {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const { data, error } = await this.client
        .from('sync_logs')
        .select('status, execution_time_ms')
        .gte('created_at', since.toISOString());

      if (error || !data) {
        return { total: 0, successful: 0, failed: 0, avgExecutionTime: 0 };
      }

      const total = data.length;
      const successful = data.filter(log => log.status === 'success').length;
      const failed = total - successful;
      const avgExecutionTime = data.reduce((sum, log) => sum + log.execution_time_ms, 0) / total;

      return { total, successful, failed, avgExecutionTime };
    } catch {
      return { total: 0, successful: 0, failed: 0, avgExecutionTime: 0 };
    }
  }
}
