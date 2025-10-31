# 🚀 Déploiement NEXUS MCP via Dashboard (avec support initialize)

## Problème

Le CLI Supabase bloque sur le bundling. La solution de contournement est le déploiement via le Dashboard Web.

## ✅ Étapes de Déploiement

### 1. Accéder à la fonction existante

URL: https://supabase.com/dashboard/project/llxgkvxqznibjnzninza/functions/nexus-mcp

### 2. Cliquer sur "Deploy new version"

### 3. Uploader l'archive

Fichier à uploader: `E:\PERSO\nexus\nexus-mcp-fixed.tar.gz`

**Ce qui a été corrigé dans cette version:**
- ✅ Support du handshake `initialize` (MCP protocol)
- ✅ Réponses JSON-RPC 2.0 conformes (`jsonrpc`, `id`, `result`)
- ✅ Codes d'erreur JSON-RPC standard (`-32601`)

### 4. Configuration

- ✅ Verify JWT: **DÉCOCHÉ** (on utilise Bearer token custom)
- ✅ Import Map Enabled: **COCHÉ**
- ✅ Entrypoint: `index.ts`

### 5. Déployer

Cliquer sur **"Deploy"** et attendre ~30-60 secondes.

---

## 🧪 Test Après Déploiement

Une fois déployé, tester avec curl:

```bash
# Test initialize handshake
curl -s -X POST "https://llxgkvxqznibjnzninza.supabase.co/functions/v1/nexus-mcp" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxseGdrdnhxem5pYmpuem5pbnphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTE1MjYsImV4cCI6MjA3NzA4NzUyNn0.dVQ_FOAJ2t4J3czKqANebDoqj3USNzLG4Tz_wLUrE_E" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":0,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}'
```

**Résultat attendu:**
```json
{
  "jsonrpc": "2.0",
  "id": 0,
  "result": {
    "protocolVersion": "2025-06-18",
    "capabilities": {
      "tools": {}
    },
    "serverInfo": {
      "name": "nexus-mcp",
      "version": "1.0.0"
    }
  }
}
```

---

## 🔄 Après le Déploiement

### 1. Redémarrer Claude Desktop

Fermez complètement et relancez Claude Desktop.

### 2. Vérifier les logs

Les logs devraient maintenant montrer:
```
[nexus-mcp-client] HTTP response: 200 OK
[nexus-mcp-client] Received result, sending to stdout
```

### 3. Tester dans Claude Desktop

Essayez ces commandes:
- "Liste mes priorités actives"
- "Quels sont mes engagements cette semaine?"
- "Recherche dans mes conversations le mot 'agents'"

---

## 📝 Fichiers Modifiés

- `supabase/functions/nexus-mcp/index.ts` - Ajout handler `initialize`
- `supabase/functions/nexus-mcp/types.ts` - Types MCP Request avec `id` et `jsonrpc`

## 🔗 Références

- Archive: `E:\PERSO\nexus\nexus-mcp-fixed.tar.gz`
- Commit: `a61153c` - "fix: Add MCP initialize handshake support"
- Dashboard: https://supabase.com/dashboard/project/llxgkvxqznibjnzninza/functions

---

**Note**: Le CLI Supabase v2.53.6 a des problèmes de bundling avec Docker. Une mise à jour vers v2.54.11 pourrait résoudre ce problème pour les futurs déploiements.
