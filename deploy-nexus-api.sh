#!/bin/bash
# Deploy NEXUS MCP via Supabase REST API

PROJECT_REF="llxgkvxqznibjnzninza"
FUNCTION_NAME="nexus-mcp"
TARBALL="nexus-mcp-fixed.tar.gz"

# Get service role key
SERVICE_KEY=$(supabase projects api-keys --project-ref $PROJECT_REF 2>/dev/null | grep "service_role" | awk -F'|' '{print $2}' | tr -d ' ')

if [ -z "$SERVICE_KEY" ]; then
    echo "❌ Failed to get service role key"
    exit 1
fi

echo "📦 Deploying $FUNCTION_NAME..."

# Use Supabase Functions API to deploy
# Note: This uses the functions deploy endpoint
curl -X POST \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/functions/$FUNCTION_NAME" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F "slug=$FUNCTION_NAME" \
  -F "verify_jwt=false" \
  -F "body=@$TARBALL"

echo ""
echo "✅ Deployment complete!"
