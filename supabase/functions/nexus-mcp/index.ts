/**
 * NEXUS MCP Server - Main Entry Point
 * Supabase Edge Function exposing NEXUS data via Model Context Protocol (HTTP)
 *
 * Architecture: Read-only MCP wrapper around existing NEXUS backend
 * - Conversations: Limitless AI
 * - Priorities: Notion Database
 * - CRM: Notion Database
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createLogger } from '../_shared/utils/logger.ts';
import { NEXUS_TOOLS } from './tools.ts';
import type { MCPRequest, MCPResponse } from './types.ts';

// Import handlers
import { handleSearchConversations } from './handlers/conversations.ts';
import { handleGetPriority, handleListPriorities } from './handlers/priorities.ts';
import { handleCRMLookup } from './handlers/crm.ts';
import { handleListCommitments } from './handlers/commitments.ts';

const logger = createLogger('nexus-mcp');

serve(async (req: Request) => {
  const startTime = Date.now();

  // CORS headers - restricted to localhost for Claude Desktop
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'http://localhost:*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Authentication: Verify Bearer token (Supabase anon key)
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: Missing or invalid Authorization header' }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const expectedToken = Deno.env.get('SUPABASE_ANON_KEY');

  if (!expectedToken) {
    logger.error('SUPABASE_ANON_KEY not configured');
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  if (token !== expectedToken) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: Invalid token' }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Parse MCP request
    const mcpRequest: MCPRequest = await req.json();
    logger.info(`MCP request: ${mcpRequest.method}`);

    let response: any;

    switch (mcpRequest.method) {
      case 'initialize':
        // MCP protocol handshake
        response = {
          jsonrpc: '2.0',
          id: mcpRequest.id,
          result: {
            protocolVersion: '2025-06-18',
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: 'nexus-mcp',
              version: '1.0.0',
            },
          },
        };
        break;

      case 'tools/list':
        // Return list of available tools
        response = {
          jsonrpc: '2.0',
          id: mcpRequest.id,
          result: {
            tools: NEXUS_TOOLS,
          },
        };
        break;

      case 'tools/call':
        // Handle tool invocation
        if (!mcpRequest.params) {
          throw new Error('Missing params for tools/call');
        }

        const { name, arguments: args } = mcpRequest.params;

        let toolResult: MCPResponse;

        switch (name) {
          case 'nexus_search_conversations':
            toolResult = await handleSearchConversations(args);
            break;

          case 'nexus_get_priority':
            toolResult = await handleGetPriority(args);
            break;

          case 'nexus_list_priorities':
            toolResult = await handleListPriorities(args);
            break;

          case 'nexus_crm_lookup':
            toolResult = await handleCRMLookup(args);
            break;

          case 'nexus_list_commitments':
            toolResult = await handleListCommitments(args);
            break;

          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        response = {
          jsonrpc: '2.0',
          id: mcpRequest.id,
          result: toolResult,
        };
        break;

      default:
        response = {
          jsonrpc: '2.0',
          id: mcpRequest.id,
          error: {
            code: -32601,
            message: `Method not found: ${mcpRequest.method}`,
          },
        };
    }

    const executionTime = Date.now() - startTime;
    logger.info(`MCP request completed in ${executionTime}ms`);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`MCP error: ${errorMessage}`);

    const errorResponse: MCPResponse = {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
});
