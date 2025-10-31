/**
 * NEXUS MCP - Commitments Handler
 * Handles nexus_list_commitments tool
 */

import { NexusSupabaseClient } from '../../_shared/utils/supabase-client.ts';
import { createLogger } from '../../_shared/utils/logger.ts';
import type { MCPResponse, ListCommitmentsArgs } from '../types.ts';

const logger = createLogger('nexus-mcp:commitments');

export async function handleListCommitments(args: ListCommitmentsArgs): Promise<MCPResponse> {
  const { days = 7, status = 'pending', limit = 10 } = args;

  // Input validation
  if (status && !['pending', 'completed', 'all'].includes(status)) {
    return {
      content: [
        {
          type: 'text',
          text: '❌ Le paramètre `status` doit être "pending", "completed" ou "all".',
        },
      ],
      isError: true,
    };
  }

  if (days < 1 || days > 365) {
    return {
      content: [
        {
          type: 'text',
          text: '❌ Le paramètre `days` doit être entre 1 et 365.',
        },
      ],
      isError: true,
    };
  }

  if (limit < 1 || limit > 100) {
    return {
      content: [
        {
          type: 'text',
          text: '❌ Le paramètre `limit` doit être entre 1 et 100.',
        },
      ],
      isError: true,
    };
  }

  logger.info(`Listing commitments: days=${days}, status=${status}, limit=${limit}`);

  try {
    const supabase = new NexusSupabaseClient();

    // Calculate date range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Build query for engagement-type priorities
    let query = supabase.client
      .from('priorities_cache')
      .select('*')
      .eq('priority_type', 'engagement')
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false });

    // Filter by status
    if (status === 'pending') {
      query = query.eq('processed', false);
    } else if (status === 'completed') {
      query = query.eq('processed', true);
    }
    // 'all' = no filter

    // Limit results
    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      const statusText = status === 'pending' ? 'en attente' : status === 'completed' ? 'complétés' : '';
      return {
        content: [
          {
            type: 'text',
            text: `Aucun engagement ${statusText} trouvé dans les derniers ${days} jours.`,
          },
        ],
      };
    }

    // Format results
    const results = data
      .map((commitment, index) => {
        const date = new Date(commitment.created_at).toLocaleDateString('fr-CA', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });

        const statusIcon = commitment.processed ? '✅' : '⏳';
        const statusText = commitment.processed ? 'COMPLÉTÉ' : 'EN ATTENTE';

        return (
          `${index + 1}. ${statusIcon} **${commitment.title}**\n` +
          `   📅 ${date} | ${statusText}\n` +
          `   🔗 Source: ${commitment.source_conversation || 'N/A'}`
        );
      })
      .join('\n\n');

    const statusLabel = status === 'pending' ? 'En Attente' : status === 'completed' ? 'Complétés' : 'Tous';

    return {
      content: [
        {
          type: 'text',
          text: (
            `Engagements ${statusLabel} (Derniers ${days} jours):\n\n` +
            `${results}\n\n` +
            `💡 Total: ${data.length} engagement${data.length > 1 ? 's' : ''}`
          ),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error listing commitments: ${errorMessage}`);

    return {
      content: [
        {
          type: 'text',
          text: `❌ Erreur lors de la liste des engagements: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
