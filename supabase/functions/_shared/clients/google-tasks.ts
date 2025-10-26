/**
 * Google Tasks API Client
 * Create and manage tasks in Google Tasks
 */

import { google } from 'googleapis';
import type { Priority, GoogleTask, GoogleTasksList, Context } from '../types/index.ts';

export class GoogleTasksClient {
  private tasks: any;
  private defaultListId?: string;

  constructor(credentials: string, defaultListId?: string) {
    // Parse credentials JSON
    const creds = JSON.parse(credentials);

    // Initialize Google Auth
    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/tasks'],
    });

    // Initialize Tasks API
    this.tasks = google.tasks({ version: 'v1', auth });
    this.defaultListId = defaultListId;
  }

  /**
   * Get all task lists
   * @returns Array of task lists
   */
  async getTaskLists(): Promise<GoogleTasksList[]> {
    try {
      const response = await this.tasks.tasklists.list();
      return response.data.items || [];
    } catch (error) {
      console.error('[Google Tasks] Failed to get task lists:', error);
      throw error;
    }
  }

  /**
   * Get or create the NEXUS default task list
   * @returns Task list ID
   */
  async getOrCreateNexusList(): Promise<string> {
    try {
      // Check if NEXUS list already exists
      const lists = await this.getTaskLists();
      const nexusList = lists.find(
        (list) => list.title === 'NEXUS - Priorités'
      );

      if (nexusList) {
        console.log(`[Google Tasks] Using existing NEXUS list: ${nexusList.id}`);
        return nexusList.id;
      }

      // Create new NEXUS list
      console.log('[Google Tasks] Creating NEXUS task list...');
      const response = await this.tasks.tasklists.insert({
        requestBody: {
          title: 'NEXUS - Priorités',
        },
      });

      console.log(`[Google Tasks] Created NEXUS list: ${response.data.id}`);
      return response.data.id;

    } catch (error) {
      console.error('[Google Tasks] Failed to get/create NEXUS list:', error);
      throw error;
    }
  }

  /**
   * Create a task from a Priority
   * @param priority - Priority object to convert to task
   * @param listId - Optional task list ID (uses default if not provided)
   * @returns Created task object
   */
  async createTaskFromPriority(
    priority: Priority,
    listId?: string
  ): Promise<GoogleTask> {
    try {
      const targetListId = listId || this.defaultListId || await this.getOrCreateNexusList();

      // Build task title with context emoji
      const title = this.formatTaskTitle(priority);

      // Build task notes with details
      const notes = this.formatTaskNotes(priority);

      // Create task
      const task: Partial<GoogleTask> = {
        title,
        notes,
        status: 'needsAction',
      };

      // Add due date if available
      if (priority.dueDate) {
        task.due = priority.dueDate.toISOString();
      }

      const response = await this.tasks.tasks.insert({
        tasklist: targetListId,
        requestBody: task,
      });

      console.log(`[Google Tasks] Created task: "${title}"`);
      return response.data;

    } catch (error) {
      console.error('[Google Tasks] Failed to create task:', error);
      throw error;
    }
  }

  /**
   * Create multiple tasks from priorities (batch)
   * @param priorities - Array of priorities
   * @param listId - Optional task list ID
   * @returns Array of created tasks
   */
  async createTasksFromPriorities(
    priorities: Priority[],
    listId?: string
  ): Promise<GoogleTask[]> {
    const targetListId = listId || this.defaultListId || await this.getOrCreateNexusList();

    console.log(`[Google Tasks] Creating ${priorities.length} tasks...`);

    const createdTasks: GoogleTask[] = [];

    for (const priority of priorities) {
      try {
        const task = await this.createTaskFromPriority(priority, targetListId);
        createdTasks.push(task);
      } catch (error) {
        console.error(`[Google Tasks] Failed to create task for: ${priority.title}`, error);
        // Continue with other tasks
      }
    }

    console.log(`[Google Tasks] Successfully created ${createdTasks.length}/${priorities.length} tasks`);
    return createdTasks;
  }

  /**
   * Format task title with context emoji
   */
  private formatTaskTitle(priority: Priority): string {
    const contextEmoji = this.getContextEmoji(priority.context);
    const durationTag = priority.duration ? ` [${priority.duration}]` : '';

    return `${contextEmoji} ${priority.title}${durationTag}`;
  }

  /**
   * Format task notes with full details
   */
  private formatTaskNotes(priority: Priority): string {
    const parts: string[] = [];

    // Description
    if (priority.description) {
      parts.push(priority.description);
      parts.push('');
    }

    // Metadata
    parts.push(`📌 Type: ${this.formatPriorityType(priority.type)}`);

    if (priority.context) {
      parts.push(`🏷️ Contexte: ${priority.context}`);
    }

    if (priority.duration) {
      parts.push(`⏱️ Durée estimée: ${priority.duration}`);
    }

    if (priority.source) {
      parts.push(`🗣️ Source: ${priority.source}`);
    }

    if (priority.confidence < 1.0) {
      parts.push(`📊 Confiance: ${Math.round(priority.confidence * 100)}%`);
    }

    parts.push('');
    parts.push('---');
    parts.push('✨ Créé automatiquement par NEXUS');

    return parts.join('\n');
  }

  /**
   * Get emoji for context
   */
  private getContextEmoji(context?: Context): string {
    const emojiMap: Record<Context, string> = {
      '@appels': '📞',
      '@ordi': '💻',
      '@agenda': '📅',
      '@attente': '⏳',
      '@courses': '🛒',
    };

    return context ? emojiMap[context] : '📋';
  }

  /**
   * Format priority type in French
   */
  private formatPriorityType(type: string): string {
    const typeMap: Record<string, string> = {
      'engagement': 'Engagement pris',
      'demande': 'Demande reçue',
      'deadline': 'Échéance',
    };

    return typeMap[type] || type;
  }

  /**
   * Get tasks from a list
   * @param listId - Task list ID
   * @param showCompleted - Include completed tasks
   * @returns Array of tasks
   */
  async getTasks(
    listId?: string,
    showCompleted: boolean = false
  ): Promise<GoogleTask[]> {
    try {
      const targetListId = listId || this.defaultListId || await this.getOrCreateNexusList();

      const response = await this.tasks.tasks.list({
        tasklist: targetListId,
        showCompleted,
      });

      return response.data.items || [];
    } catch (error) {
      console.error('[Google Tasks] Failed to get tasks:', error);
      throw error;
    }
  }

  /**
   * Mark task as complete
   * @param taskId - Task ID
   * @param listId - Task list ID
   */
  async completeTask(taskId: string, listId?: string): Promise<void> {
    try {
      const targetListId = listId || this.defaultListId || await this.getOrCreateNexusList();

      await this.tasks.tasks.patch({
        tasklist: targetListId,
        task: taskId,
        requestBody: {
          status: 'completed',
        },
      });

      console.log(`[Google Tasks] Marked task as complete: ${taskId}`);
    } catch (error) {
      console.error('[Google Tasks] Failed to complete task:', error);
      throw error;
    }
  }

  /**
   * Delete task
   * @param taskId - Task ID
   * @param listId - Task list ID
   */
  async deleteTask(taskId: string, listId?: string): Promise<void> {
    try {
      const targetListId = listId || this.defaultListId || await this.getOrCreateNexusList();

      await this.tasks.tasks.delete({
        tasklist: targetListId,
        task: taskId,
      });

      console.log(`[Google Tasks] Deleted task: ${taskId}`);
    } catch (error) {
      console.error('[Google Tasks] Failed to delete task:', error);
      throw error;
    }
  }

  /**
   * Health check - verify API connectivity
   */
  async isConnected(): Promise<boolean> {
    try {
      await this.getTaskLists();
      return true;
    } catch {
      return false;
    }
  }
}
