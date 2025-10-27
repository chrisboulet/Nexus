/**
 * Claude (Anthropic) API Client
 * AI-powered priority detection and analysis
 */

import Anthropic from 'npm:@anthropic-ai/sdk@^0.20.0';
import type {
  LimitlessConversation,
  Priority,
  ClaudeAnalysisResponse,
} from '../types/index.ts';

export class ClaudeClient {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-sonnet-4-5-20250929') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  /**
   * Analyze conversations and extract priorities
   * @param conversations - Array of Limitless conversations
   * @param context - Optional additional context
   * @returns Detected priorities with confidence scores
   */
  async analyzePriorities(
    conversations: LimitlessConversation[],
    context?: string
  ): Promise<ClaudeAnalysisResponse> {
    const startTime = Date.now();

    try {
      console.log(`[Claude] Analyzing ${conversations.length} conversations...`);

      // Build conversation context
      const conversationText = this.buildConversationContext(conversations);

      // Construct analysis prompt
      const prompt = this.buildAnalysisPrompt(conversationText, context);

      // Call Claude API
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        temperature: 0.3, // Lower temperature for consistent extraction
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Parse Claude's response
      const analysisText = response.content[0].type === 'text'
        ? response.content[0].text
        : '';

      const priorities = this.parsePrioritiesFromResponse(analysisText, conversations);

      const processingTime = Date.now() - startTime;

      console.log(`[Claude] Detected ${priorities.length} priorities in ${processingTime}ms`);

      return {
        priorities,
        summary: analysisText,
        confidence: this.calculateOverallConfidence(priorities),
        processingTime,
      };

    } catch (error) {
      console.error('[Claude] Analysis failed:', error);
      throw error;
    }
  }

  /**
   * Build conversation context for Claude
   */
  private buildConversationContext(conversations: LimitlessConversation[]): string {
    return conversations
      .map((conv, index) => {
        const date = new Date(conv.startTime).toLocaleDateString('fr-CA');
        const time = new Date(conv.startTime).toLocaleTimeString('fr-CA');

        return `
--- Conversation ${index + 1} ---
Date: ${date} à ${time}
${conv.title ? `Sujet: ${conv.title}` : ''}
${conv.participants ? `Participants: ${conv.participants.join(', ')}` : ''}

Transcript:
${conv.transcript}
${conv.summary ? `\nRésumé: ${conv.summary}` : ''}
`;
      })
      .join('\n\n');
  }

  /**
   * Build analysis prompt for Claude
   */
  private buildAnalysisPrompt(conversationText: string, context?: string): string {
    return `Tu es NEXUS, l'assistant IA de Christian Boulet, fractional CTO chez Boulet Stratégies TI.

Ta mission: analyser les conversations de Christian et extraire TOUTES les priorités potentielles.

${context ? `\nContexte additionnel:\n${context}\n` : ''}

# Critères de détection (INCLUSIFS)

Cherche ces 3 types de priorités:

1. **ENGAGEMENTS** - Christian a promis ou dit qu'il va faire quelque chose
   - Exemples EXPLICITES: "je vais te revenir avec une proposition", "je t'envoie mon CV"
   - Exemples IMPLICITES: "je vais le régler", "il faut que je...", "je dois..."
   - Même vague, si ça indique une intention d'action future, INCLURE
   - Contexte souvent: @ordi (travail ordinateur)

2. **DEMANDES** - Quelqu'un a demandé quelque chose à Christian OU Christian a identifié une tâche à faire
   - Exemples: "peux-tu m'envoyer...", "j'aurais besoin que...", "il faudrait que..."
   - INCLURE aussi les auto-demandes: "il faut que je vérifie", "je devrais appeler"
   - Contexte: @appels (si retour de call), @ordi (si travail)

3. **DEADLINES** - Échéances mentionnées (même vagues)
   - Exemples PRÉCIS: "avant vendredi", "deadline 30 octobre"
   - Exemples VAGUES: "demain", "la semaine prochaine", "bientôt"
   - Accepter les deadlines implicites aussi

# Consignes PERMISSIVES

- ✅ MIEUX VAUT inclure une priorité douteuse que de la manquer
- ✅ ACCEPTER les engagements vagues ou informels ("je vais le régler", "faut que je...")
- ✅ ACCEPTER les intentions même sans deadline précise
- ✅ Score de confiance bas (0.3-0.5) pour les priorités vagues, élevé (0.7-1.0) pour les explicites
- ✅ Estimer la durée réaliste (5min, 15min, 30min, 1h, 2h+)
- ✅ Assigner un contexte (@appels, @ordi, @agenda, @attente)

# Format de réponse

Retourne un JSON structuré:

\`\`\`json
{
  "priorities": [
    {
      "title": "Titre court et actionnable",
      "type": "engagement|demande|deadline",
      "description": "Description détaillée avec contexte",
      "context": "@appels|@ordi|@agenda|@attente|@courses",
      "duration": "5min|15min|30min|1h|2h+",
      "confidence": 0.95,
      "source": "Conversation avec [Nom]",
      "dueDate": "2025-01-30" // SEULEMENT pour deadlines
    }
  ]
}
\`\`\`

# Conversations à analyser

${conversationText}

# Ton analyse (JSON uniquement)`;
  }

  /**
   * Parse priorities from Claude's JSON response
   */
  private parsePrioritiesFromResponse(
    responseText: string,
    conversations: LimitlessConversation[]
  ): Priority[] {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
                       responseText.match(/{[\s\S]*}/);

      if (!jsonMatch) {
        console.warn('[Claude] No JSON found in response');
        return [];
      }

      const jsonText = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonText);

      const priorities: Priority[] = parsed.priorities || [];

      // Enrich with source timestamps
      return priorities.map((p) => ({
        ...p,
        sourceTimestamp: this.findConversationTimestamp(p.source, conversations),
      }));

    } catch (error) {
      console.error('[Claude] Failed to parse priorities:', error);
      return [];
    }
  }

  /**
   * Find conversation timestamp from source description
   */
  private findConversationTimestamp(
    source: string,
    conversations: LimitlessConversation[]
  ): Date | undefined {
    // Try to match conversation by participants or title
    const conv = conversations.find(
      (c) =>
        c.title?.toLowerCase().includes(source.toLowerCase()) ||
        c.participants?.some((p) => source.toLowerCase().includes(p.toLowerCase()))
    );

    return conv ? new Date(conv.startTime) : undefined;
  }

  /**
   * Calculate overall confidence from priorities
   */
  private calculateOverallConfidence(priorities: Priority[]): number {
    if (priorities.length === 0) return 0;

    const avgConfidence =
      priorities.reduce((sum, p) => sum + p.confidence, 0) / priorities.length;

    return Math.round(avgConfidence * 100) / 100;
  }

  /**
   * Health check - verify API connectivity
   */
  async isConnected(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      });
      return true;
    } catch {
      return false;
    }
  }
}
