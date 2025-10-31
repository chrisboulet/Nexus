# Phase 1: Validation ytmemory MCP Local

**Date**: 31 octobre 2025
**Status**: Ready for Testing
**Durée estimée**: 15-20 minutes

---

## ✅ Pré-requis (Déjà Complétés)

- ✅ Docker Desktop installé et en cours d'exécution
- ✅ Container `ytmemory-mcp-server` actif et healthy
- ✅ Configuration Claude Desktop mise à jour avec ytmemory MCP
- ✅ MCP server tourne en mode stdio

**Fichier de configuration**:
```
C:\Users\cboulet\AppData\Roaming\Claude\claude_desktop_config.json
```

---

## 🧪 Tests de Validation

### Test 1: Vérifier la Connexion MCP

**Action**: Redémarrer Claude Desktop (pour charger la config)

**Dans Claude Desktop, demander**:
```
Quels sont les MCP servers disponibles?
```

**Résultat attendu**:
- ✅ Voir "ytmemory" dans la liste
- ✅ Voir "zen" dans la liste

---

### Test 2: Lister les Outils ytmemory

**Dans Claude Desktop, demander**:
```
Liste tous les outils disponibles dans le MCP ytmemory
```

**Résultat attendu**: Devrait voir les 8 outils ytmemory:
1. ✅ `ytmemory_search` - Recherche texte dans les vidéos
2. ✅ `ytmemory_get_video` - Détails d'une vidéo spécifique
3. ✅ `ytmemory_list_recent` - Vidéos récentes analysées
4. ✅ `ytmemory_filter_by_topic` - Filtrer par sujet/keyword
5. ✅ `ytmemory_semantic_search` - Recherche sémantique (embeddings)
6. ✅ `ytmemory_analyze` - Analyser une nouvelle vidéo
7. ✅ `ytmemory_recommend` - Recommandations personnalisées
8. ✅ `ytmemory_sync` - Synchroniser vidéos likées

---

### Test 3: Recherche Simple (Text Search)

**Dans Claude Desktop, demander**:
```
Utilise ytmemory pour chercher des vidéos sur "JavaScript"
```

**Résultat attendu**:
- ✅ Claude appelle `ytmemory_search` avec query="JavaScript"
- ✅ Reçoit une liste de vidéos (peut être vide si aucune vidéo JS dans la DB)
- ✅ Affiche titres, canaux, et extraits des vidéos

**Si aucune vidéo trouvée**: Normal si la DB ytmemory est vide ou ne contient pas de vidéos JS.

---

### Test 4: Lister les Vidéos Récentes

**Dans Claude Desktop, demander**:
```
Montre-moi les 5 dernières vidéos analysées dans ytmemory
```

**Résultat attendu**:
- ✅ Claude appelle `ytmemory_list_recent` avec limit=5
- ✅ Affiche 5 vidéos avec:
  - Titre
  - Canal
  - Date d'analyse
  - YouTube ID

**Si aucune vidéo**: La base de données ytmemory est peut-être vide. Voir Test 6 pour ajouter une vidéo.

---

### Test 5: Recherche Sémantique (Advanced)

**Dans Claude Desktop, demander**:
```
Utilise la recherche sémantique ytmemory pour trouver des vidéos sur "apprentissage automatique et IA"
```

**Résultat attendu**:
- ✅ Claude appelle `ytmemory_semantic_search` avec embeddings
- ✅ Retourne vidéos similaires sémantiquement (même si les mots exacts diffèrent)
- ✅ Affiche scores de similarité (pourcentages)
- ✅ Inclut moments clés et ressources si disponibles

**Note**: Nécessite que les vidéos aient des embeddings générés. Si erreur → normal, continuer.

---

### Test 6: Analyser une Nouvelle Vidéo (Optionnel)

**Si vous voulez tester l'analyse en temps réel**:

**Dans Claude Desktop, demander**:
```
Analyse cette vidéo YouTube et ajoute-la à ma base de connaissances:
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

**Résultat attendu**:
- ✅ Claude appelle `ytmemory_analyze` avec l'URL
- ✅ Extraction de transcription (~5-10 secondes)
- ✅ Analyse avec Claude API (~15-30 secondes)
- ✅ Confirmation de sauvegarde dans la DB
- ✅ Retourne résumé exécutif, points clés, etc.

**Durée totale**: 20-40 secondes

---

### Test 7: Recommandations Personnalisées

**Dans Claude Desktop, demander**:
```
Recommande-moi des vidéos ytmemory pour apprendre "Docker et conteneurisation"
```

**Résultat attendu**:
- ✅ Claude appelle `ytmemory_recommend` avec la requête
- ✅ Utilise similarité sémantique pour trouver contenu pertinent
- ✅ Affiche top 5 recommandations avec:
  - Score de pertinence
  - Niveau de complexité
  - Résumé
  - Lien YouTube

---

### Test 8: Filtrage par Topic

**Dans Claude Desktop, demander**:
```
Trouve toutes les vidéos ytmemory avec le topic "AI" ou "artificial intelligence"
```

**Résultat attendu**:
- ✅ Claude appelle `ytmemory_filter_by_topic` avec topic="AI"
- ✅ Recherche dans le champ `topics_keywords`
- ✅ Retourne vidéos matchées avec leurs topics

---

## 🐛 Dépannage

### Problème: Claude Desktop ne voit pas ytmemory

**Solutions**:
1. Vérifier que Docker Desktop est bien démarré
2. Vérifier que le container tourne:
   ```bash
   docker ps | grep ytmemory
   ```
3. Redémarrer Claude Desktop complètement (Quit + relancer)
4. Vérifier le fichier de config:
   ```
   C:\Users\cboulet\AppData\Roaming\Claude\claude_desktop_config.json
   ```

### Problème: Erreur "Container not found"

**Solution**: Redémarrer le container ytmemory:
```bash
docker restart ytmemory-mcp-server
```

### Problème: "No videos found" pour toutes les recherches

**Cause**: Base de données ytmemory vide

**Solution**: Utiliser Test 6 pour analyser quelques vidéos, OU:
```bash
# Via CLI ytmemory (si disponible)
cd /path/to/ytmemory
npm run dev -- sync --days 7
```

### Problème: Erreurs sur semantic_search

**Cause**: Embeddings non générés pour les vidéos

**Solution normale**: Les embeddings sont optionnels. ytmemory fonctionne sans (text search reste disponible).

---

## ✅ Critères de Succès Phase 1

**Phase 1 est validée si**:
1. ✅ Claude Desktop se connecte à ytmemory MCP (Test 1)
2. ✅ Les 8 outils ytmemory sont listés (Test 2)
3. ✅ Au moins 1 recherche fonctionne (Test 3, 4 ou 5)
4. ✅ Pas d'erreurs de connexion Docker/stdio

**Résultat minimum acceptable**:
- ytmemory MCP accessible via Claude Desktop
- Peut lister les outils
- Peut exécuter au moins une requête (même si DB vide)

---

## 📝 Résultats de Test (À Remplir)

**Date du test**: _________________

| Test | Status | Notes |
|------|--------|-------|
| Test 1: Connexion MCP | ⬜ Pass / ⬜ Fail | |
| Test 2: Liste outils | ⬜ Pass / ⬜ Fail | |
| Test 3: Recherche texte | ⬜ Pass / ⬜ Fail | |
| Test 4: Vidéos récentes | ⬜ Pass / ⬜ Fail | |
| Test 5: Recherche sémantique | ⬜ Pass / ⬜ Fail | |
| Test 6: Analyser vidéo | ⬜ Pass / ⬜ Fail / ⬜ Skip | |
| Test 7: Recommandations | ⬜ Pass / ⬜ Fail | |
| Test 8: Filtrer par topic | ⬜ Pass / ⬜ Fail | |

**Notes additionnelles**:
```
[Espace pour notes]
```

---

## 🎯 Prochaine Étape

**Une fois Phase 1 validée** → Passer à **Phase 2**: Créer NEXUS MCP Serverless

**Si blocage** → Documenter l'erreur et ajuster la configuration

---

## 📞 Support

**Logs ytmemory MCP**:
```bash
docker logs ytmemory-mcp-server --tail 50
```

**Restart container**:
```bash
docker restart ytmemory-mcp-server
```

**Config Claude Desktop**:
```
C:\Users\cboulet\AppData\Roaming\Claude\claude_desktop_config.json
```

---

**Document préparé par**: Claude Code
**Dernière mise à jour**: 2025-10-31
