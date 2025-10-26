/**
 * Notion API Client
 * Manage CRM (Leads, Clients, Projects) in Notion workspace
 */

import { Client } from 'npm:@notionhq/client@2.2.15';
import type { NotionLead, NotionClient, NotionProject } from '../types/index.ts';

export class NotionClient {
  private client: Client;
  private workspaceId: string;
  private leadsDatabase?: string;
  private clientsDatabase?: string;
  private projectsDatabase?: string;

  constructor(
    token: string,
    workspaceId: string,
    databases?: {
      leads?: string;
      clients?: string;
      projects?: string;
    }
  ) {
    this.client = new Client({ auth: token });
    this.workspaceId = workspaceId;
    this.leadsDatabase = databases?.leads;
    this.clientsDatabase = databases?.clients;
    this.projectsDatabase = databases?.projects;
  }

  /**
   * Create a new lead in Notion CRM
   * @param lead - Lead information
   * @returns Created page object
   */
  async createLead(lead: NotionLead): Promise<any> {
    if (!this.leadsDatabase) {
      throw new Error('Leads database ID not configured');
    }

    try {
      console.log(`[Notion] Creating lead: ${lead.name}`);

      const response = await this.client.pages.create({
        parent: { database_id: this.leadsDatabase },
        properties: {
          'Nom': {
            title: [{ text: { content: lead.name } }],
          },
          'Entreprise': lead.company
            ? { rich_text: [{ text: { content: lead.company } }] }
            : undefined,
          'Statut': {
            select: { name: this.formatLeadStatus(lead.status) },
          },
          'Dernière interaction': {
            date: { start: lead.lastInteraction.toISOString() },
          },
          'Prochaine action': lead.nextAction
            ? { rich_text: [{ text: { content: lead.nextAction } }] }
            : undefined,
          'Source': lead.source
            ? { rich_text: [{ text: { content: lead.source } }] }
            : undefined,
        },
        children: lead.notes
          ? [
              {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                  rich_text: [{ text: { content: lead.notes } }],
                },
              },
            ]
          : undefined,
      });

      console.log(`[Notion] Lead created: ${response.id}`);
      return response;

    } catch (error) {
      console.error('[Notion] Failed to create lead:', error);
      throw error;
    }
  }

  /**
   * Create a new client in Notion CRM
   * @param client - Client information
   * @returns Created page object
   */
  async createClient(client: NotionClient): Promise<any> {
    if (!this.clientsDatabase) {
      throw new Error('Clients database ID not configured');
    }

    try {
      console.log(`[Notion] Creating client: ${client.name}`);

      const response = await this.client.pages.create({
        parent: { database_id: this.clientsDatabase },
        properties: {
          'Nom': {
            title: [{ text: { content: client.name } }],
          },
          'Entreprise': {
            rich_text: [{ text: { content: client.company } }],
          },
          'Mandat': client.mandate
            ? { rich_text: [{ text: { content: client.mandate } }] }
            : undefined,
          'Statut': {
            select: { name: this.formatClientStatus(client.status) },
          },
          'Début': client.startDate
            ? { date: { start: client.startDate.toISOString() } }
            : undefined,
          'Fin prévue': client.endDate
            ? { date: { start: client.endDate.toISOString() } }
            : undefined,
          'Prochaine livraison': client.nextDeliverable
            ? { rich_text: [{ text: { content: client.nextDeliverable } }] }
            : undefined,
        },
      });

      console.log(`[Notion] Client created: ${response.id}`);
      return response;

    } catch (error) {
      console.error('[Notion] Failed to create client:', error);
      throw error;
    }
  }

  /**
   * Create a new project in Notion
   * @param project - Project information
   * @returns Created page object
   */
  async createProject(project: NotionProject): Promise<any> {
    if (!this.projectsDatabase) {
      throw new Error('Projects database ID not configured');
    }

    try {
      console.log(`[Notion] Creating project: ${project.title}`);

      const response = await this.client.pages.create({
        parent: { database_id: this.projectsDatabase },
        properties: {
          'Titre': {
            title: [{ text: { content: project.title } }],
          },
          'Client': {
            rich_text: [{ text: { content: project.client } }],
          },
          'Statut': {
            select: { name: this.formatProjectStatus(project.status) },
          },
          'Next Action': project.nextAction
            ? { rich_text: [{ text: { content: project.nextAction } }] }
            : undefined,
          'Deadline': project.deadline
            ? { date: { start: project.deadline.toISOString() } }
            : undefined,
        },
      });

      console.log(`[Notion] Project created: ${response.id}`);
      return response;

    } catch (error) {
      console.error('[Notion] Failed to create project:', error);
      throw error;
    }
  }

  /**
   * Search for existing lead by name
   * @param name - Lead name
   * @returns Page object if found, null otherwise
   */
  async findLeadByName(name: string): Promise<any | null> {
    if (!this.leadsDatabase) {
      return null;
    }

    try {
      const response = await this.client.databases.query({
        database_id: this.leadsDatabase,
        filter: {
          property: 'Nom',
          title: {
            contains: name,
          },
        },
      });

      return response.results.length > 0 ? response.results[0] : null;
    } catch (error) {
      console.error('[Notion] Failed to search lead:', error);
      return null;
    }
  }

  /**
   * Update existing lead
   * @param pageId - Notion page ID
   * @param updates - Fields to update
   */
  async updateLead(
    pageId: string,
    updates: Partial<NotionLead>
  ): Promise<any> {
    try {
      const properties: any = {};

      if (updates.status) {
        properties['Statut'] = {
          select: { name: this.formatLeadStatus(updates.status) },
        };
      }

      if (updates.lastInteraction) {
        properties['Dernière interaction'] = {
          date: { start: updates.lastInteraction.toISOString() },
        };
      }

      if (updates.nextAction) {
        properties['Prochaine action'] = {
          rich_text: [{ text: { content: updates.nextAction } }],
        };
      }

      const response = await this.client.pages.update({
        page_id: pageId,
        properties,
      });

      console.log(`[Notion] Lead updated: ${pageId}`);
      return response;

    } catch (error) {
      console.error('[Notion] Failed to update lead:', error);
      throw error;
    }
  }

  /**
   * Format lead status for Notion select
   */
  private formatLeadStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'cold': '⚪ Froid',
      'warm': '🟡 Tiède',
      'hot': '🔥 Chaud',
      'client': '🟢 Client',
    };
    return statusMap[status] || status;
  }

  /**
   * Format client status for Notion select
   */
  private formatClientStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'active': '🟢 Actif',
      'paused': '🟡 Pause',
      'completed': '✅ Complété',
    };
    return statusMap[status] || status;
  }

  /**
   * Format project status for Notion select
   */
  private formatProjectStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'active': '🔵 Actif',
      'waiting': '🟡 Attente',
      'completed': '✅ Complété',
      'someday': '⚪ Someday',
    };
    return statusMap[status] || status;
  }

  /**
   * Health check - verify API connectivity
   */
  async isConnected(): Promise<boolean> {
    try {
      await this.client.users.me({});
      return true;
    } catch {
      return false;
    }
  }
}
