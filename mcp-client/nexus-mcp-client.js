#!/usr/bin/env node
/**
 * NEXUS MCP Client - HTTP to stdio bridge
 * Connects Claude Desktop (stdio) to NEXUS Edge Function (HTTP)
 */

const NEXUS_URL = 'https://llxgkvxqznibjnzninza.supabase.co/functions/v1/nexus-mcp';
const BEARER_TOKEN = process.env.BEARER_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxseGdrdnhxem5pYmpuem5pbnphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTE1MjYsImV4cCI6MjA3NzA4NzUyNn0.dVQ_FOAJ2t4J3czKqANebDoqj3USNzLG4Tz_wLUrE_E';

// Log to stderr (not interfering with stdout JSON-RPC)
function log(msg) {
  console.error(`[nexus-mcp-client] ${msg}`);
}

log('Starting NEXUS MCP client...');

// Parse JSON-RPC from stdin
let buffer = '';

process.stdin.setEncoding('utf8');

process.stdin.on('data', async (chunk) => {
  buffer += chunk.toString();
  log(`Received data: ${buffer.substring(0, 100)}...`);

  // Process complete JSON-RPC messages (newline-delimited)
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';

  for (const line of lines) {
    if (!line.trim()) continue;

    try {
      const request = JSON.parse(line);
      log(`Processing request: ${request.method} (id: ${request.id})`);
      await handleRequest(request);
    } catch (error) {
      log(`Parse error: ${error.message}`);
      console.error('Parse error:', error.message);
    }
  }
});

async function handleRequest(request) {
  try {
    log(`Forwarding to ${NEXUS_URL}...`);

    // Forward request to NEXUS HTTP endpoint
    const response = await fetch(NEXUS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    log(`HTTP response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    log(`Received result, sending to stdout`);

    // Send response back via stdout (newline-delimited JSON-RPC)
    process.stdout.write(JSON.stringify(result) + '\n');
  } catch (error) {
    log(`Error: ${error.message}`);

    // Send error response
    const errorResponse = {
      jsonrpc: '2.0',
      id: request.id,
      error: {
        code: -32603,
        message: error.message,
      },
    };
    process.stdout.write(JSON.stringify(errorResponse) + '\n');
  }
}

process.stdin.resume();

// Handle stdin close
process.stdin.on('end', () => {
  log('stdin closed, exiting');
  process.exit(0);
});

// Handle errors
process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error.message}`);
  console.error('Uncaught exception:', error);
  process.exit(1);
});

log('NEXUS MCP client ready, waiting for requests...');
