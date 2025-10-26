/**
 * NEXUS Weekly Sync Edge Function
 * Runs every Friday at 2 PM EST
 *
 * Workflow:
 * 1. Fetch Limitless conversations from last 7 days
 * 2. Analyze with Claude for CRM insights (leads, clients, projects)
 * 3. Update Notion CRM databases
 * 4. Log execution
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { LimitlessClient } from '../_shared/clients/limitless.ts';
import { ClaudeClient } from '../_shared/clients/claude.ts';
import { NotionClient } from '../_shared/clients/notion.ts';
import { NexusSupabaseClient } from '../_shared/utils/supabase-client.ts';
import { createLogger } from '../_shared/utils/logger.ts';
import type { NotionLead, NotionClient as NotionClientType, NotionProject } from '../_shared/types/index.ts';

const logger = createLogger('nexus-weekly-sync');

serve(async (req: Request) => {
  const startTime = Date.now();
  logger.info('🚀 Weekly CRM sync started');

  try {
    // ======================================
    // 1. Initialize clients
    // ======================================

    const limitless = new LimitlessClient(
      Deno.env.get('LIMITLESS_API_KEY')!,
      Deno.env.get('LIMITLESS_ENDPOINT')
    );

    const claude = new ClaudeClient(
      Deno.env.get('ANTHROPIC_API_KEY')!,
      Deno.env.get('ANTHROPIC_MODEL')
    );

    const notion = new NotionClient(
      Deno.env.get('NOTION_TOKEN')!,
      Deno.env.get('NOTION_WORKSPACE_ID')!,
      {
        leads: Deno.env.get('NOTION_LEADS_DATABASE_ID'),
        clients: Deno.env.get('NOTION_CLIENTS_DATABASE_ID'),
        projects: Deno.env.get('NOTION_PROJECTS_DATABASE_ID'),
      }
    );

    const supabase = new NexusSupabaseClient();

    logger.info('✅ All clients initialized');

    // ======================================
    // 2. Fetch conversations from last 7 days
    // ======================================

    logger.info('📅 Fetching conversations from last 7 days');
    const conversations = await limitless.getRecentConversations(24 * 7); // 7 days

    if (conversations.length === 0) {
      logger.info('✨ No conversations found');

      await supabase.logSync({
        syncType: 'weekly',
        status: 'success',
        prioritiesFound: 0,
        tasksCreated: 0,
        executionTimeMs: Date.now() - startTime,
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'No conversations to analyze',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    logger.info(`📝 Found ${conversations.length} conversations`);

    // ======================================
    // 3. Analyze for CRM insights with Claude
    // ======================================

    const crmAnalysisPrompt = `Tu es NEXUS, l'assistant CRM de Christian Boulet, fractional CTO.

Analyse ces conversations de la dernière semaine et identifie:

1. **NOUVEAUX LEADS** - Personnes/entreprises mentionnées comme prospects potentiels
   - Nom et entreprise
   - Statut estimé (cold/warm/hot)
   - Notes contextuelles

2. **MISES À JOUR CLIENTS** - Interactions avec clients existants
   - Nom client
   - Sujets discutés
   - Prochaines actions

3. **NOUVEAUX PROJETS** - Projets ou mandats mentionnés
   - Titre projet
   - Client associé
   - Statut (active/waiting/someday)

Format de réponse JSON:

\`\`\`json
{
  "leads": [
    {
      "name": "Marc Veilleux",
      "company": "ESI Technologies",
      "status": "hot",
      "lastInteraction": "2025-01-26",
      "nextAction": "Envoyer proposition fractional CTO",
      "source": "Conversation téléphonique",
      "notes": "Intéressé par transformation IA"
    }
  ],
  "clients": [
    {
      "name": "FLB",
      "company": "FLB Inc",
      "status": "active",
      "mandate": "Architecture cloud",
      "nextDeliverable": "Documentation architecture"
    }
  ],
  "projects": [
    {
      "title": "Migration AWS → Azure",
      "client": "ABC Corp",
      "status": "active",
      "nextAction": "Planifier migration phase 1",
      "deadline": "2025-02-15"
    }
  ]
}
\`\`\`

Conversations:
${conversations.map((c, i) => `\n=== Conversation ${i + 1} ===\n${c.transcript}`).join('\n')}

Ton analyse (JSON uniquement):`;

    logger.info('🤖 Analyzing conversations with Claude...');

    const response = await claude.client.messages.create({
      model: claude['model'],
      max_tokens: 8192,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: crmAnalysisPrompt,
        },
      ],
    });

    const analysisText = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    // Parse JSON response
    const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/) ||
                     analysisText.match(/{[\s\S]*}/);

    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }

    const crmData = JSON.parse(jsonMatch[1] || jsonMatch[0]);

    logger.info(`✅ CRM Analysis complete`);
    logger.info(`  - Leads: ${crmData.leads?.length || 0}`);
    logger.info(`  - Clients: ${crmData.clients?.length || 0}`);
    logger.info(`  - Projects: ${crmData.projects?.length || 0}`);

    // ======================================
    // 4. Update Notion CRM
    // ======================================

    let leadsCreated = 0;
    let clientsUpdated = 0;
    let projectsCreated = 0;

    // Create/update leads
    if (crmData.leads && crmData.leads.length > 0) {
      for (const lead of crmData.leads) {
        try {
          // Check if lead already exists
          const existing = await notion.findLeadByName(lead.name);

          if (existing) {
            // Update existing lead
            await notion.updateLead(existing.id, {
              status: lead.status,
              lastInteraction: new Date(lead.lastInteraction),
              nextAction: lead.nextAction,
            });
            logger.info(`📝 Updated lead: ${lead.name}`);
          } else {
            // Create new lead
            await notion.createLead({
              name: lead.name,
              company: lead.company,
              status: lead.status,
              lastInteraction: new Date(lead.lastInteraction),
              nextAction: lead.nextAction,
              source: lead.source,
              notes: lead.notes,
            });
            leadsCreated++;
            logger.info(`✨ Created new lead: ${lead.name}`);
          }
        } catch (error) {
          logger.error(`Failed to process lead: ${lead.name}`, error);
        }
      }
    }

    // Create/update clients
    if (crmData.clients && crmData.clients.length > 0) {
      for (const client of crmData.clients) {
        try {
          await notion.createClient({
            name: client.name,
            company: client.company,
            status: client.status,
            mandate: client.mandate,
            nextDeliverable: client.nextDeliverable,
          });
          clientsUpdated++;
          logger.info(`✨ Updated client: ${client.name}`);
        } catch (error) {
          logger.error(`Failed to update client: ${client.name}`, error);
        }
      }
    }

    // Create projects
    if (crmData.projects && crmData.projects.length > 0) {
      for (const project of crmData.projects) {
        try {
          await notion.createProject({
            title: project.title,
            client: project.client,
            status: project.status,
            nextAction: project.nextAction,
            deadline: project.deadline ? new Date(project.deadline) : undefined,
          });
          projectsCreated++;
          logger.info(`✨ Created project: ${project.title}`);
        } catch (error) {
          logger.error(`Failed to create project: ${project.title}`, error);
        }
      }
    }

    // ======================================
    // 5. Log execution
    // ======================================

    const executionTime = Date.now() - startTime;

    await supabase.logSync({
      syncType: 'weekly',
      status: 'success',
      prioritiesFound: conversations.length,
      tasksCreated: leadsCreated + clientsUpdated + projectsCreated,
      executionTimeMs: executionTime,
    });

    logger.info(`🎉 Weekly sync completed in ${executionTime}ms`);

    // ======================================
    // 6. Return summary
    // ======================================

    return new Response(
      JSON.stringify({
        success: true,
        conversationsAnalyzed: conversations.length,
        leadsCreated,
        clientsUpdated,
        projectsCreated,
        executionTime,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    logger.error('❌ Weekly sync failed', error);

    const supabase = new NexusSupabaseClient();
    await supabase.logSync({
      syncType: 'weekly',
      status: 'error',
      prioritiesFound: 0,
      tasksCreated: 0,
      errorMessage: error instanceof Error ? error.message : String(error),
      executionTimeMs: Date.now() - startTime,
    });

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
