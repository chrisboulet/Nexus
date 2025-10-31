/**
 * NEXUS MCP - Conversations Handler
 * Handles nexus_search_conversations tool
 */

import { LimitlessClient } from '../../_shared/clients/limitless.ts';
import { createLogger } from '../../_shared/utils/logger.ts';
import type { MCPResponse, SearchConversationsArgs } from '../types.ts';

const logger = createLogger('nexus-mcp:conversations');

export async function handleSearchConversations(
  args: SearchConversationsArgs
): Promise<MCPResponse> {
  const { query, days = 30, limit = 10 } = args;

  // Input validation
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: '❌ Le paramètre `query` est requis et doit être une chaîne non vide.',
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

  logger.info(`Searching conversations: query="${query}", days=${days}, limit=${limit}`);

  try {
    // Validate environment variables
    const apiKey = Deno.env.get('LIMITLESS_API_KEY');
    if (!apiKey) {
      throw new Error('Configuration error: LIMITLESS_API_KEY not set');
    }

    // Initialize Limitless client
    const limitless = new LimitlessClient(
      apiKey,
      Deno.env.get('LIMITLESS_ENDPOINT')
    );

    // Calculate date range
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Fetch conversations
    const conversations = await limitless.getConversationsSinceLastSync(since);

    if (conversations.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `Aucune conversation trouvée dans les derniers ${days} jours.`,
          },
        ],
      };
    }

    // Filter by query (case-insensitive search in transcript)
    const filtered = conversations.filter((conv) => {
      const searchText = `${conv.title} ${conv.transcript}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });

    const limitedResults = filtered.slice(0, limit);

    if (limitedResults.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `Aucune conversation ne correspond à "${query}" dans les derniers ${days} jours.`,
          },
        ],
      };
    }

    // Format results
    const results = limitedResults
      .map((conv, index) => {
        const date = new Date(conv.timestamp).toLocaleString('fr-CA', {
          dateStyle: 'short',
          timeStyle: 'short',
        });

        // Extract relevant snippet (first 200 chars around query)
        const transcript = conv.transcript.toLowerCase();
        const queryIndex = transcript.indexOf(query.toLowerCase());
        let snippet = '';

        if (queryIndex !== -1) {
          const start = Math.max(0, queryIndex - 100);
          const end = Math.min(conv.transcript.length, queryIndex + 100);
          snippet = '...' + conv.transcript.substring(start, end) + '...';
        } else {
          snippet = conv.transcript.substring(0, 200) + '...';
        }

        return (
          `${index + 1}. **${conv.title}** (${date})\n` +
          `   📝 ${snippet}\n` +
          `   🔗 ID: ${conv.id}`
        );
      })
      .join('\n\n');

    return {
      content: [
        {
          type: 'text',
          text: `Trouvé ${limitedResults.length} conversation(s) pour "${query}":\n\n${results}`,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error searching conversations: ${errorMessage}`);

    return {
      content: [
        {
          type: 'text',
          text: `❌ Erreur lors de la recherche de conversations: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
