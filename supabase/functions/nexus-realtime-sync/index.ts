/**
 * NEXUS Realtime Sync Edge Function
 * Runs every 30 minutes during work hours (7 AM - 7 PM EST)
 *
 * Workflow:
 * 1. Fetch new Limitless conversations since last sync
 * 2. Analyze with Claude (only if new conversations)
 * 3. Create tasks in Google Tasks
 * 4. Cache priorities to avoid duplicates
 * 5. Log execution
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { LimitlessClient } from '../_shared/clients/limitless.ts';
import { ClaudeClient } from '../_shared/clients/claude.ts';
import { NotionClient } from '../_shared/clients/notion.ts';
import { NexusSupabaseClient } from '../_shared/utils/supabase-client.ts';
import { createLogger } from '../_shared/utils/logger.ts';
import type { Priority, SyncResult } from '../_shared/types/index.ts';

const logger = createLogger('nexus-realtime-sync');

serve(async (req: Request) => {
  const startTime = Date.now();
  logger.info('🚀 Realtime sync started');

  try {
    // ======================================
    // 1. Initialize clients
    // ======================================

    const limitless = new LimitlessClient(
      Deno.env.get('LIMITLESS_API_KEY')!,
      Deno.env.get('LIMITLESS_ENDPOINT')
    );

    const claude = new ClaudeClient(
      Deno.env.get('ANTHROPIC_API_KEY')!,
      Deno.env.get('ANTHROPIC_MODEL')
    );

    const notion = new NotionClient(
      Deno.env.get('NOTION_TOKEN')!,
      Deno.env.get('NOTION_WORKSPACE_ID')!,
      {
        priorities: Deno.env.get('NOTION_PRIORITIES_DATABASE_ID'),
      }
    );

    const supabase = new NexusSupabaseClient();

    logger.info('✅ All clients initialized');

    // ======================================
    // 2. Get last sync time (for deduplication)
    // ======================================

    const lastSyncTime = await supabase.getLastSyncTime('realtime');
    const since = lastSyncTime || new Date(Date.now() - 30 * 60 * 1000); // Default: last 30 min

    logger.info(`📅 Fetching conversations since ${since.toISOString()}`);

    // ======================================
    // 3. Fetch new conversations from Limitless
    // ======================================

    const conversations = await limitless.getConversationsSinceLastSync(since);

    if (conversations.length === 0) {
      logger.info('✨ No new conversations - skipping analysis');

      // Log successful sync (even if no work)
      await supabase.logSync({
        syncType: 'realtime',
        status: 'success',
        prioritiesFound: 0,
        tasksCreated: 0,
        executionTimeMs: Date.now() - startTime,
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'No new conversations',
          conversationsAnalyzed: 0,
          prioritiesDetected: 0,
          tasksCreated: 0,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    logger.info(`📝 Found ${conversations.length} new conversations`);

    // ======================================
    // 4. Analyze with Claude
    // ======================================

    const analysisResult = await claude.analyzePriorities(conversations);
    const { priorities } = analysisResult;

    logger.info(`🎯 Detected ${priorities.length} priorities (confidence: ${analysisResult.confidence})`);

    if (priorities.length === 0) {
      logger.info('✨ No priorities detected - nothing to do');

      await supabase.logSync({
        syncType: 'realtime',
        status: 'success',
        prioritiesFound: 0,
        tasksCreated: 0,
        executionTimeMs: Date.now() - startTime,
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'No priorities detected',
          conversationsAnalyzed: conversations.length,
          prioritiesDetected: 0,
          tasksCreated: 0,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // ======================================
    // 5. Deduplicate priorities
    // ======================================

    const newPriorities: Priority[] = [];

    for (const priority of priorities) {
      const exists = await supabase.priorityExists(
        priority.title,
        priority.source
      );

      if (!exists) {
        newPriorities.push(priority);

        // Cache this priority
        await supabase.cachePriority({
          title: priority.title,
          priorityType: priority.type,
          context: priority.context,
          sourceConversation: priority.source,
          confidence: priority.confidence,
        });
      } else {
        logger.debug(`⏭️  Skipping duplicate: "${priority.title}"`);
      }
    }

    logger.info(`✅ ${newPriorities.length}/${priorities.length} are new (deduplicated)`);

    if (newPriorities.length === 0) {
      logger.info('✨ All priorities already exist - nothing to create');

      await supabase.logSync({
        syncType: 'realtime',
        status: 'success',
        prioritiesFound: priorities.length,
        tasksCreated: 0,
        executionTimeMs: Date.now() - startTime,
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'All priorities already exist (duplicates)',
          conversationsAnalyzed: conversations.length,
          prioritiesDetected: priorities.length,
          tasksCreated: 0,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // ======================================
    // 6. Create priorities in Notion
    // ======================================

    const createdPriorities = [];
    for (const priority of newPriorities) {
      try {
        const created = await notion.createPriority(priority);
        createdPriorities.push(created);
      } catch (error) {
        logger.error(`Failed to create priority: ${priority.title}`, error);
      }
    }

    logger.info(`✅ Created ${createdPriorities.length} priorities in Notion`);

    // ======================================
    // 7. Log execution
    // ======================================

    const executionTime = Date.now() - startTime;

    await supabase.logSync({
      syncType: 'realtime',
      status: 'success',
      prioritiesFound: priorities.length,
      tasksCreated: createdPriorities.length,
      executionTimeMs: executionTime,
    });

    logger.info(`🎉 Sync completed successfully in ${executionTime}ms`);

    // ======================================
    // 8. Return summary
    // ======================================

    const result: SyncResult = {
      conversationsAnalyzed: conversations.length,
      prioritiesDetected: priorities.length,
      tasksCreated: createdPriorities.length,
      errors: [],
      timestamp: new Date(),
    };

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    logger.error('❌ Sync failed', error);

    // Log error
    const supabase = new NexusSupabaseClient();
    await supabase.logSync({
      syncType: 'realtime',
      status: 'error',
      prioritiesFound: 0,
      tasksCreated: 0,
      errorMessage: error instanceof Error ? error.message : String(error),
      executionTimeMs: Date.now() - startTime,
    });

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
