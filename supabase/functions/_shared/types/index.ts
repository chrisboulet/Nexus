/**
 * NEXUS TypeScript Type Definitions
 * Shared types across all Edge Functions
 */

// ============================================
// Priority Types
// ============================================

export type PriorityType = 'engagement' | 'demande' | 'deadline';
export type Context = '@appels' | '@ordi' | '@agenda' | '@attente' | '@courses';
export type Duration = '5min' | '15min' | '30min' | '1h' | '2h+';

export interface Priority {
  id?: string;
  title: string;
  type: PriorityType;
  description?: string;
  context?: Context;
  duration?: Duration;
  confidence: number; // 0.0 to 1.0
  source: string; // e.g., "Conversation with Marc Veilleux"
  sourceTimestamp?: Date;
  dueDate?: Date;
}

export interface Engagement extends Priority {
  type: 'engagement';
  commitment: string; // What was promised
}

export interface Demande extends Priority {
  type: 'demande';
  requester: string; // Who requested
  urgency?: 'low' | 'medium' | 'high';
}

export interface Deadline extends Priority {
  type: 'deadline';
  dueDate: Date; // Required for deadlines
  timeRemaining?: string; // e.g., "2 days"
}

// ============================================
// Limitless API Types
// ============================================

export interface LimitlessConversation {
  id: string;
  title?: string;
  transcript: string;
  startTime: string; // ISO timestamp
  endTime?: string;
  participants?: string[];
  summary?: string;
}

export interface LimitlessLifelog {
  id: string;
  type: 'conversation' | 'note' | 'meeting';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// ============================================
// Google Tasks API Types
// ============================================

export interface GoogleTask {
  id?: string;
  title: string;
  notes?: string;
  due?: string; // RFC 3339 timestamp
  status?: 'needsAction' | 'completed';
  links?: Array<{
    type: string;
    description: string;
    link: string;
  }>;
}

export interface GoogleTasksList {
  id: string;
  title: string;
  updated?: string;
}

// ============================================
// Notion API Types
// ============================================

export interface NotionLead {
  name: string;
  company?: string;
  status: 'cold' | 'warm' | 'hot' | 'client';
  lastInteraction: Date;
  nextAction?: string;
  notes?: string;
  source?: string;
}

export interface NotionClient {
  name: string;
  company: string;
  mandate?: string;
  startDate?: Date;
  endDate?: Date;
  status: 'active' | 'paused' | 'completed';
  nextDeliverable?: string;
}

export interface NotionProject {
  title: string;
  client: string;
  status: 'active' | 'waiting' | 'completed' | 'someday';
  nextAction?: string;
  deadline?: Date;
}

// ============================================
// Database Types
// ============================================

export interface SyncLog {
  id?: string;
  syncType: 'realtime' | 'daily' | 'weekly';
  status: 'success' | 'error' | 'partial';
  prioritiesFound: number;
  tasksCreated: number;
  errorMessage?: string;
  executionTimeMs: number;
  createdAt?: Date;
}

export interface PriorityCache {
  id?: string;
  title: string;
  priorityType: PriorityType;
  context?: Context;
  sourceConversation: string;
  confidence: number;
  processed: boolean;
  createdAt?: Date;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  executionTime?: number;
}

export interface SyncResult {
  conversationsAnalyzed: number;
  prioritiesDetected: number;
  tasksCreated: number;
  errors: string[];
  timestamp: Date;
}

// ============================================
// Configuration Types
// ============================================

export interface NexusConfig {
  limitless: {
    apiKey: string;
    endpoint: string;
  };
  anthropic: {
    apiKey: string;
    model: string;
  };
  notion: {
    token: string;
    workspaceId: string;
  };
  google: {
    credentials: string; // JSON stringified
    tasksListId?: string;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
  };
}

// ============================================
// Claude Analysis Types
// ============================================

export interface ClaudeAnalysisRequest {
  conversations: LimitlessConversation[];
  context?: string;
}

export interface ClaudeAnalysisResponse {
  priorities: Priority[];
  summary: string;
  confidence: number;
  processingTime: number;
}
