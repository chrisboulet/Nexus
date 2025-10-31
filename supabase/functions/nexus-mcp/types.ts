/**
 * NEXUS MCP Server - Type Definitions
 * MCP-specific types for request/response handling
 */

export interface MCPRequest {
  method: 'tools/list' | 'tools/call';
  params?: MCPCallParams;
}

export interface MCPCallParams {
  name: string;
  arguments: Record<string, any>;
}

export interface MCPResponse {
  content: MCPContent[];
  isError?: boolean;
}

export interface MCPContent {
  type: 'text';
  text: string;
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

// Tool-specific argument types
export interface SearchConversationsArgs {
  query: string;
  days?: number;
  limit?: number;
}

export interface GetPriorityArgs {
  id?: string;
  title?: string;
}

export interface ListPrioritiesArgs {
  status?: 'active' | 'completed' | 'all';
  days?: number;
  context?: string;
  limit?: number;
}

export interface CRMLookupArgs {
  name?: string;
  company?: string;
  type?: 'lead' | 'client' | 'all';
}

export interface ListCommitmentsArgs {
  days?: number;
  status?: 'pending' | 'completed' | 'all';
  limit?: number;
}
