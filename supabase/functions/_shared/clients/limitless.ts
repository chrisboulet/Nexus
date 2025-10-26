/**
 * Limitless API Client
 * Fetch conversations, lifelogs, and transcripts from Limitless
 */

import type { LimitlessConversation, LimitlessLifelog } from '../types/index.ts';

export class LimitlessClient {
  private apiKey: string;
  private endpoint: string;

  constructor(apiKey: string, endpoint: string = 'https://api.limitless.ai/v1') {
    this.apiKey = apiKey;
    this.endpoint = endpoint.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Fetch lifelogs within a time range
   * @param since - ISO timestamp or Date object
   * @param limit - Maximum number of results
   * @returns Array of lifelog objects with transcripts
   */
  async getLifelogs(
    since: string | Date,
    limit: number = 100
  ): Promise<LimitlessConversation[]> {
    try {
      const sinceISO = typeof since === 'string' ? since : since.toISOString();

      console.log(`[Limitless] Fetching lifelogs since ${sinceISO}`);

      const url = new URL(`${this.endpoint}/lifelogs`);
      url.searchParams.append('since', sinceISO);
      url.searchParams.append('limit', limit.toString());
      url.searchParams.append('include_transcripts', 'true');

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Limitless API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const lifelogs = data.lifelogs || [];

      console.log(`[Limitless] Retrieved ${lifelogs.length} lifelogs`);
      return lifelogs;

    } catch (error) {
      console.error('[Limitless] Failed to fetch lifelogs:', error);
      throw error;
    }
  }

  /**
   * Get conversations from the last N hours
   * @param hours - Number of hours to look back
   * @returns Array of conversations
   */
  async getRecentConversations(hours: number = 24): Promise<LimitlessConversation[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.getLifelogs(since);
  }

  /**
   * Get conversations since last sync (for realtime sync)
   * @param lastSyncTime - Timestamp of last successful sync
   * @returns Array of new conversations since last sync
   */
  async getConversationsSinceLastSync(
    lastSyncTime: Date
  ): Promise<LimitlessConversation[]> {
    return this.getLifelogs(lastSyncTime);
  }

  /**
   * Search conversations with semantic search
   * @param query - Search query
   * @param limit - Maximum results
   * @returns Array of matching conversations
   */
  async searchConversations(
    query: string,
    limit: number = 10
  ): Promise<LimitlessConversation[]> {
    try {
      console.log(`[Limitless] Searching for: "${query}"`);

      const response = await fetch(`${this.endpoint}/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          limit,
          include_transcripts: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Limitless search error: ${response.status}`);
      }

      const data = await response.json();
      const results = data.results || [];

      console.log(`[Limitless] Found ${results.length} matching conversations`);
      return results;

    } catch (error) {
      console.error('[Limitless] Search failed:', error);
      throw error;
    }
  }

  /**
   * Health check - verify API connectivity
   * @returns true if API is accessible
   */
  async isConnected(): Promise<boolean> {
    try {
      const response = await fetch(`${this.endpoint}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Helper: Extract key information from conversations
 */
export function extractConversationContext(
  conversations: LimitlessConversation[]
): string {
  return conversations
    .map((conv, index) => {
      const timestamp = new Date(conv.startTime).toLocaleString('fr-CA');
      const participants = conv.participants?.join(', ') || 'Unknown';

      return `
=== Conversation ${index + 1} ===
Date: ${timestamp}
Participants: ${participants}
${conv.title ? `Title: ${conv.title}` : ''}
Transcript:
${conv.transcript}
${conv.summary ? `Summary: ${conv.summary}` : ''}
`;
    })
    .join('\n\n');
}
