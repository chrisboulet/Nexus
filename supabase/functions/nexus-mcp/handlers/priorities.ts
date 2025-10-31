/**
 * NEXUS MCP - Priorities Handler
 * Handles nexus_get_priority and nexus_list_priorities tools
 */

import { NotionClient } from '../../_shared/clients/notion.ts';
import { NexusSupabaseClient } from '../../_shared/utils/supabase-client.ts';
import { createLogger } from '../../_shared/utils/logger.ts';
import type { MCPResponse, GetPriorityArgs, ListPrioritiesArgs } from '../types.ts';

const logger = createLogger('nexus-mcp:priorities');

export async function handleGetPriority(args: GetPriorityArgs): Promise<MCPResponse> {
  const { id, title } = args;

  if (!id && !title) {
    return {
      content: [
        {
          type: 'text',
          text: '❌ Veuillez fournir soit `id` soit `title` pour chercher une priorité.',
        },
      ],
      isError: true,
    };
  }

  logger.info(`Getting priority: id=${id}, title=${title}`);

  try {
    const supabase = new NexusSupabaseClient();

    // Search in priorities_cache
    let query = supabase.client
      .from('priorities_cache')
      .select('*');

    if (id) {
      query = query.eq('id', id);
    } else if (title) {
      query = query.ilike('title', `%${title}%`);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Aucune priorité trouvée${id ? ` avec l'ID ${id}` : ` correspondant à "${title}"`}`,
          },
        ],
      };
    }

    // Format priority details
    const formattedDate = new Date(data.created_at).toLocaleDateString('fr-CA', {
      dateStyle: 'medium',
    });

    const priorityInfo = (
      `# ${data.title}\n\n` +
      `📋 **Type**: ${data.priority_type}\n` +
      `🎯 **Context**: ${data.context || 'Non spécifié'}\n` +
      `📅 **Créée**: ${formattedDate}\n` +
      `✨ **Confiance**: ${(data.confidence * 100).toFixed(0)}%\n` +
      `🔗 **Source**: ${data.source_conversation || 'N/A'}\n\n` +
      `**Statut**: ${data.processed ? '✅ Traitée' : '⏳ En attente'}`
    );

    return {
      content: [
        {
          type: 'text',
          text: priorityInfo,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error getting priority: ${errorMessage}`);

    return {
      content: [
        {
          type: 'text',
          text: `❌ Erreur lors de la récupération de la priorité: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}

export async function handleListPriorities(args: ListPrioritiesArgs): Promise<MCPResponse> {
  const { status = 'active', days, context, limit = 20 } = args;

  // Input validation
  if (status && !['active', 'completed', 'all'].includes(status)) {
    return {
      content: [
        {
          type: 'text',
          text: '❌ Le paramètre `status` doit être "active", "completed" ou "all".',
        },
      ],
      isError: true,
    };
  }

  if (days !== undefined && (days < 1 || days > 365)) {
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

  logger.info(`Listing priorities: status=${status}, days=${days}, context=${context}, limit=${limit}`);

  try {
    const supabase = new NexusSupabaseClient();

    // Build query
    let query = supabase.client
      .from('priorities_cache')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by status
    if (status === 'active') {
      query = query.eq('processed', false);
    } else if (status === 'completed') {
      query = query.eq('processed', true);
    }
    // 'all' = no filter

    // Filter by days
    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      query = query.gte('created_at', cutoffDate.toISOString());
    }

    // Filter by context
    if (context) {
      query = query.ilike('context', `%${context}%`);
    }

    // Limit results
    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `Aucune priorité trouvée avec les filtres spécifiés (status=${status}${context ? `, context=${context}` : ''}).`,
          },
        ],
      };
    }

    // Format results
    const results = data
      .map((priority, index) => {
        const date = new Date(priority.created_at).toLocaleDateString('fr-CA');
        const statusIcon = priority.processed ? '✅' : '⏳';
        const contextBadge = priority.context || '';

        return (
          `${index + 1}. ${statusIcon} **${priority.title}**\n` +
          `   📋 ${priority.priority_type} | ${contextBadge} | ${date}`
        );
      })
      .join('\n\n');

    const statusLabel = status === 'active' ? 'Actives' : status === 'completed' ? 'Complétées' : 'Toutes';

    return {
      content: [
        {
          type: 'text',
          text: `Priorités ${statusLabel} (${data.length} résultat${data.length > 1 ? 's' : ''}):\n\n${results}`,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error listing priorities: ${errorMessage}`);

    return {
      content: [
        {
          type: 'text',
          text: `❌ Erreur lors de la liste des priorités: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
