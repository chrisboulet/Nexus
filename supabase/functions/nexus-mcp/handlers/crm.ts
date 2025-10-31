/**
 * NEXUS MCP - CRM Handler
 * Handles nexus_crm_lookup tool
 */

import { NotionClient } from '../../_shared/clients/notion.ts';
import { createLogger } from '../../_shared/utils/logger.ts';
import type { MCPResponse, CRMLookupArgs } from '../types.ts';

const logger = createLogger('nexus-mcp:crm');

export async function handleCRMLookup(args: CRMLookupArgs): Promise<MCPResponse> {
  const { name, company, type = 'all' } = args;

  if (!name && !company) {
    return {
      content: [
        {
          type: 'text',
          text: '❌ Veuillez fournir soit `name` soit `company` pour chercher dans le CRM.',
        },
      ],
      isError: true,
    };
  }

  logger.info(`CRM lookup: name=${name}, company=${company}, type=${type}`);

  try {
    // Validate environment variables
    const notionToken = Deno.env.get('NOTION_TOKEN');
    const notionWorkspaceId = Deno.env.get('NOTION_WORKSPACE_ID');

    if (!notionToken || !notionWorkspaceId) {
      throw new Error('Configuration error: NOTION_TOKEN or NOTION_WORKSPACE_ID not set');
    }

    const notion = new NotionClient(notionToken, notionWorkspaceId);

    // Note: This is a simplified implementation
    // In production, you would query specific Notion CRM databases
    // For now, return a placeholder message

    const searchTerm = name || company;

    return {
      content: [
        {
          type: 'text',
          text: (
            `🔍 Recherche CRM pour "${searchTerm}"...\n\n` +
            `⚠️ **Note**: L'intégration CRM complète avec Notion est en développement.\n\n` +
            `**Prochaine étape**: Configurer les IDs des databases Notion pour Leads et Clients dans les variables d'environnement:\n` +
            `- NOTION_LEADS_DATABASE_ID\n` +
            `- NOTION_CLIENTS_DATABASE_ID\n\n` +
            `Une fois configuré, ce tool pourra rechercher dans vos databases Notion CRM.`
          ),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error in CRM lookup: ${errorMessage}`);

    return {
      content: [
        {
          type: 'text',
          text: `❌ Erreur lors de la recherche CRM: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
