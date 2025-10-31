/**
 * NEXUS MCP Server - Tool Definitions
 * Defines the 5 MCP tools exposed by NEXUS
 */

import type { MCPToolDefinition } from './types.ts';

export const NEXUS_TOOLS: MCPToolDefinition[] = [
  {
    name: 'nexus_search_conversations',
    description: 'Search Limitless conversations by text query. Searches through recent conversations for mentions of people, topics, or keywords.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (e.g., "Marc Veilleux", "agents IA", "ESI Tech")',
        },
        days: {
          type: 'number',
          description: 'Optional: Limit to conversations from last N days (default: 30)',
          default: 30,
        },
        limit: {
          type: 'number',
          description: 'Optional: Maximum number of results (default: 10)',
          default: 10,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'nexus_get_priority',
    description: 'Get details of a specific priority by ID or title. Returns full priority information from Notion.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Notion page ID of the priority',
        },
        title: {
          type: 'string',
          description: 'Priority title (fuzzy match)',
        },
      },
    },
  },
  {
    name: 'nexus_list_priorities',
    description: 'List priorities with optional filters. Shows active tasks, commitments, and deadlines.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by status',
          enum: ['active', 'completed', 'all'],
          default: 'active',
        },
        days: {
          type: 'number',
          description: 'Show priorities created in last N days',
        },
        context: {
          type: 'string',
          description: 'Filter by context tag (e.g., "@appels", "@ordi")',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 20)',
          default: 20,
        },
      },
    },
  },
  {
    name: 'nexus_crm_lookup',
    description: 'Lookup CRM information (leads, clients) by name or company. Returns contact details and interaction history from Notion CRM.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Person name to search for',
        },
        company: {
          type: 'string',
          description: 'Company name to search for',
        },
        type: {
          type: 'string',
          description: 'Type of contact',
          enum: ['lead', 'client', 'all'],
          default: 'all',
        },
      },
    },
  },
  {
    name: 'nexus_list_commitments',
    description: 'List recent commitments made in conversations. Shows promises, agreements, and follow-ups that need action.',
    inputSchema: {
      type: 'object',
      properties: {
        days: {
          type: 'number',
          description: 'List commitments from last N days (default: 7)',
          default: 7,
        },
        status: {
          type: 'string',
          description: 'Filter by status',
          enum: ['pending', 'completed', 'all'],
          default: 'pending',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 10)',
          default: 10,
        },
      },
    },
  },
];
