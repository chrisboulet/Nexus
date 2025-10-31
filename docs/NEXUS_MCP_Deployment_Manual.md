# Guide de Déploiement Manuel - NEXUS MCP

## Prérequis

- Accès au Dashboard Supabase: https://supabase.com/dashboard/project/llxgkvxqznibjnzninza
- Les fichiers à déployer sont dans: `supabase/functions/nexus-mcp/`

## Étape 1: Préparer les fichiers

Tous les fichiers sont prêts dans `E:\PERSO\nexus\supabase\functions\nexus-mcp\`:

```
nexus-mcp/
├── index.ts              # Point d'entrée principal
├── types.ts              # Définitions TypeScript
├── tools.ts              # Définitions des 5 outils MCP
├── deno.json            # Configuration Deno
├── import_map.json      # Import map
└── handlers/
    ├── conversations.ts  # Handler recherche conversations
    ├── priorities.ts     # Handler priorités
    ├── commitments.ts    # Handler engagements
    └── crm.ts           # Handler CRM
```

## Étape 2: Déployer via Dashboard

### Option A: Upload ZIP (Recommandé)

1. Créer une archive ZIP de `nexus-mcp/`:
   ```powershell
   cd supabase\functions
   Compress-Archive -Path nexus-mcp\* -DestinationPath nexus-mcp.zip
   ```

2. Aller sur: https://supabase.com/dashboard/project/llxgkvxqznibjnzninza/functions

3. Cliquer **"Deploy a new function"**

4. Sélectionner **"Upload ZIP"**

5. Uploader `nexus-mcp.zip`

6. Nom de la fonction: `nexus-mcp`

7. Décocher **"Verify JWT"** (notre fonction utilise Bearer token custom)

### Option B: Copier-Coller le Code

1. Aller sur: https://supabase.com/dashboard/project/llxgkvxqznibjnzninza/functions

2. Cliquer **"Deploy a new function"**

3. Nom: `nexus-mcp`

4. Copier-coller le contenu de `index.ts`

5. Ajouter les fichiers supplémentaires via l'éditeur

**Note**: Cette option est plus fastidieuse car il faut créer chaque fichier manuellement.

## Étape 3: Configurer les Secrets

Aller sur: https://supabase.com/dashboard/project/llxgkvxqznibjnzninza/settings/functions

Ajouter les secrets suivants:

| Secret | Valeur | Note |
|--------|--------|------|
| `LIMITLESS_API_KEY` | `lim_...` | Clé API Limitless |
| `LIMITLESS_ENDPOINT` | `https://api.limitless.ai/v1` | Optionnel (valeur par défaut) |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Clé API Claude |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-5-20250929` | Optionnel (valeur par défaut) |
| `NOTION_TOKEN` | `secret_...` | Token d'intégration Notion |
| `NOTION_WORKSPACE_ID` | `a8803c33-4e63-816d-a693-0003102f3eb9` | Workspace Notion |
| `NOTION_PRIORITIES_DATABASE_ID` | `4d7998e63e3d4713861c1da6e13dd77b` | Database Notion |
| `SUPABASE_ANON_KEY` | (Auto) | Fourni automatiquement par Supabase |

**Important**:
- `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont fournis automatiquement par Supabase
- Après avoir ajouté/modifié des secrets, **redéployer la fonction** pour qu'elle les prenne en compte

## Étape 4: Tester le Déploiement

Une fois déployé, l'URL sera:
```
https://llxgkvxqznibjnzninza.supabase.co/functions/v1/nexus-mcp
```

### Test 1: Vérifier l'authentification

```powershell
# Test sans token (devrait retourner 401)
curl -X POST "https://llxgkvxqznibjnzninza.supabase.co/functions/v1/nexus-mcp" `
  -H "Content-Type: application/json" `
  -d '{"method":"tools/list"}'
```

**Résultat attendu**: `401 Unauthorized`

### Test 2: Lister les outils MCP

```powershell
# Test avec token (remplacer YOUR_ANON_KEY)
curl -X POST "https://llxgkvxqznibjnzninza.supabase.co/functions/v1/nexus-mcp" `
  -H "Authorization: Bearer YOUR_ANON_KEY" `
  -H "Content-Type: application/json" `
  -d '{"method":"tools/list"}'
```

**Résultat attendu**: JSON avec la liste des 5 outils:
```json
{
  "tools": [
    {
      "name": "nexus_search_conversations",
      "description": "...",
      "inputSchema": {...}
    },
    ...
  ]
}
```

### Test 3: Appeler un outil

```powershell
curl -X POST "https://llxgkvxqznibjnzninza.supabase.co/functions/v1/nexus-mcp" `
  -H "Authorization: Bearer YOUR_ANON_KEY" `
  -H "Content-Type: application/json" `
  -d '{
    "method": "tools/call",
    "params": {
      "name": "nexus_list_priorities",
      "arguments": {
        "status": "active",
        "limit": 5
      }
    }
  }'
```

**Résultat attendu**: JSON avec la liste des priorités actives

## Étape 5: Configurer Claude Desktop

Une fois testé, ajouter NEXUS MCP à `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ytmemory": {
      "command": "docker",
      "args": ["exec", "-i", "ytmemory-mcp-server", "node", "dist/mcp/server.js"],
      "env": {
        "NODE_ENV": "production"
      }
    },
    "nexus": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-http", "https://llxgkvxqznibjnzninza.supabase.co/functions/v1/nexus-mcp"],
      "env": {
        "BEARER_TOKEN": "YOUR_SUPABASE_ANON_KEY"
      }
    }
  }
}
```

## Dépannage

### Erreur 401 Unauthorized
- Vérifier que le header `Authorization: Bearer YOUR_KEY` est présent
- Vérifier que la clé anon est correcte

### Erreur 500 Internal Server Error
- Vérifier les logs: https://supabase.com/dashboard/project/llxgkvxqznibjnzninza/logs/edge-functions
- Vérifier que tous les secrets sont configurés
- Redéployer la fonction après avoir ajouté les secrets

### Fonction ne se déploie pas
- Vérifier qu'il n'y a pas d'erreurs TypeScript dans le code
- Vérifier que `import_map.json` et `deno.json` sont présents
- Essayer de supprimer la fonction et la recréer

### Imports relatifs ne fonctionnent pas
- Vérifier que `import_map.json` pointe correctement vers `../_shared/`
- Vérifier que le dossier `_shared/` est accessible
- Si problème persiste, créer une version standalone (copier _shared dans nexus-mcp)

## Référence: Anon Key

Récupérer votre Anon Key:
```bash
supabase projects api-keys --project-ref llxgkvxqznibjnzninza
```

Ou via Dashboard:
https://supabase.com/dashboard/project/llxgkvxqznibjnzninza/settings/api

## Monitoring

- **Logs Edge Function**: https://supabase.com/dashboard/project/llxgkvxqznibjnzninza/logs/edge-functions
- **Metrics**: https://supabase.com/dashboard/project/llxgkvxqznibjnzninza/logs/edge-functions?type=metrics
- **Invocations**: Chaque appel MCP sera loggé avec timestamp et durée

---

**Prochaines étapes après déploiement**:
1. ✅ Tester les 5 outils MCP via curl
2. ✅ Configurer Claude Desktop avec les 2 MCPs (ytmemory + NEXUS)
3. ✅ Tester les requêtes cross-source (Phase 3)
