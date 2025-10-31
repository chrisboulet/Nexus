# Deploy NEXUS MCP via Supabase Management API
# Requires Supabase access token

$projectRef = "llxgkvxqznibjnzninza"
$functionName = "nexus-mcp"
$tarballPath = "nexus-mcp-fixed.tar.gz"

Write-Host "🚀 Deploying NEXUS MCP via API..." -ForegroundColor Cyan

# Get access token from Supabase CLI
Write-Host "📝 Getting access token..." -ForegroundColor Yellow
$accessToken = & supabase auth token 2>$null

if (-not $accessToken) {
    Write-Host "❌ Failed to get access token. Please login: supabase login" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Access token obtained" -ForegroundColor Green

# Prepare multipart form data
$boundary = [System.Guid]::NewGuid().ToString()
$filePath = Resolve-Path $tarballPath
$fileBytes = [System.IO.File]::ReadAllBytes($filePath)
$fileContent = [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($fileBytes)

$bodyLines = @(
    "--$boundary",
    "Content-Disposition: form-data; name=`"slug`"",
    "",
    $functionName,
    "--$boundary",
    "Content-Disposition: form-data; name=`"verify_jwt`"",
    "",
    "false",
    "--$boundary",
    "Content-Disposition: form-data; name=`"import_map`"",
    "",
    "true",
    "--$boundary",
    "Content-Disposition: form-data; name=`"entrypoint_path`"",
    "",
    "index.ts",
    "--$boundary",
    "Content-Disposition: form-data; name=`"body`"; filename=`"function.tar.gz`"",
    "Content-Type: application/gzip",
    "",
    $fileContent,
    "--$boundary--"
)

$body = $bodyLines -join "`r`n"

# Deploy function
Write-Host "📦 Uploading function..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $accessToken"
    "Content-Type" = "multipart/form-data; boundary=$boundary"
}

$uri = "https://api.supabase.com/v1/projects/$projectRef/functions/$functionName"

try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body -ContentType "multipart/form-data; boundary=$boundary"
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.Exception.Response
    exit 1
}
