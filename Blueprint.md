# 🎯 NEXUS Blueprint
**Strategic Coordination & Unified Tracking**  
*Personal AI Assistant for Boulet Stratégies TI*

**Version:** 0.1 - MVP  
**Date:** 23 octobre 2024  
**Propriétaire:** Christian Boulet

---

## 1. Vision & Objectif

### Pourquoi NEXUS existe
En tant que fractional CTO solo, Christian jongle entre :
- Multiples conversations prospects/clients (enregistrées dans Limitless)
- Engagements pris verbalement qui doivent être suivis
- Pipeline de ventes à documenter dans Notion CRM
- Recherche et qualification de nouveaux leads

**Problème :** Rien ne se perd, tout se transforme... en oubli. Les engagements verbaux, les demandes clients, les deadlines mentionnés en passant - tout ça vit dans les lifelogs Limitless mais n'est jamais structuré ni actionné.

**Solution :** NEXUS analyse automatiquement les lifelogs, extrait ce qui compte, et transforme ça en actions concrètes dans Notion.

### Objectif MVP (Phase 1)
**Livrer en 1 semaine :**
1. Détecter les priorités du jour/semaine depuis Limitless
2. Créer automatiquement des TODOs dans Notion
3. CLI simple et rapide (`nexus priorities today`)

**Résultat :** Christian commence chaque journée en sachant exactement quoi faire, sans avoir à relire ses notes.

---

## 2. Use Cases Prioritaires

### Use Case #1 : Priorités Quotidiennes (MVP - Semaine 1)
**Commande :** `nexus priorities today` ou `nexus priorities week`

**Flow :**
1. Fetch lifelogs Limitless (conversations + notes vocales)
2. Analyse avec Claude → extrait :
   - ✅ Engagements pris ("je vais te revenir avec une proposition")
   - ✅ Demandes reçues ("peux-tu m'envoyer ton CV?")
   - ✅ Deadlines mentionnés ("il me faut ça avant vendredi")
3. Génère liste markdown priorités
4. Crée automatiquement TODOs dans Notion
5. Output console + lien Notion board

**Critères de succès :**
- Temps d'exécution < 30 secondes
- Précision > 90% (pas de faux positifs critiques)
- 100% des priorités détectées créées dans Notion

**Données d'entrée (Limitless) :**
- Transcripts de conversations (audio/vidéo)
- Notes vocales personnelles
- Période : dernières 24h (today) ou 7 jours (week)

**Output :**
```markdown
## 🎯 Priorités du jour - 23 octobre 2024

### Engagements pris
- [ ] Préparer proposition Fractional CTO pour Marc Veilleux (ESI)
- [ ] Envoyer calendrier disponibilités à JF Poulin

### Demandes reçues
- [ ] FLB : documenter architecture actuelle avant départ
- [ ] Guy Tremblay : partager case studies transformation IA

### Deadlines
- [ ] Finaliser REQ Boulet Stratégies TI (deadline: 25 oct)

---
✅ 5 TODOs créés dans Notion : https://notion.so/...
```

---

### Use Case #2 : Nouveau Lead (Phase 2 - Semaine 2-3)
**Commande :** `nexus lead "LMS Systems"`

**Flow :**
1. Recherche web → info entreprise, secteur, taille, contacts
2. Analyse avec Claude → évalue le fit avec offre Boulet Stratégies
3. Génère recommandations d'approche
4. Crée automatiquement entrée CRM dans Notion avec :
   - Nom entreprise
   - Secteur / CA estimé
   - Contacts identifiés
   - Score de fit (1-10)
   - Angles d'approche suggérés
   - Prochaines actions

**Critères de succès :**
- Recherche complète en < 2 minutes
- CRM entry créée automatiquement
- Recommandations actionnables

---

## 3. Architecture Technique

### Stack Technologique
```
nexus/
├── skills/                      # Claude Skills (Anthropic pattern)
│   ├── priority-detector/       # ⭐ MVP Phase 1
│   │   ├── SKILL.md            # Instructions Claude
│   │   ├── scripts/
│   │   │   ├── limitless_api.py
│   │   │   └── notion_todo.py
│   │   └── resources/
│   │       └── prompt_templates.json
│   │
│   ├── lead-researcher/         # Phase 2
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       ├── web_research.py
│   │       └── notion_crm.py
│   │
│   └── calendar-sync/           # Phase 3 (future)
│       └── SKILL.md
│
├── src/
│   ├── nexus_cli.py            # Point d'entrée CLI
│   ├── connectors/
│   │   ├── limitless.py        # Wrapper API Limitless
│   │   ├── notion.py           # Wrapper API Notion
│   │   └── claude.py           # Anthropic API
│   └── utils/
│       └── config.py           # Gestion config/secrets
│
├── config/
│   └── config.yaml             # API keys (gitignored)
│
├── tests/                      # Tests unitaires
├── requirements.txt
└── README.md
```

### Intégrations Externes

**Limitless API**
- Endpoint : `https://api.limitless.ai/v1/`
- Authentification : API Key (X-API-KEY header)
- Fonctions utilisées :
  - `GET /lifelogs` : Récupérer conversations/notes
  - `POST /search` : Recherche sémantique dans historique

**Notion API**
- Endpoint : `https://api.notion.com/v1/`
- Authentification : Bearer Token
- Fonctions utilisées :
  - `POST /pages` : Créer TODO dans database
  - `PATCH /pages/{id}` : Mettre à jour status

**Claude API (Anthropic)**
- SDK Python : `anthropic`
- Modèle : `claude-sonnet-4-5-20250929`
- Features utilisées :
  - Skills (custom priority-detector)
  - Messages API pour analyse

### Pattern Skills Anthropic

Chaque skill suit la structure :
```
skill-name/
├── SKILL.md                    # YAML frontmatter + instructions
│   ├── name: (64 chars max)
│   ├── description: (1024 chars max)
│   └── markdown instructions
├── scripts/                    # Code Python exécutable
└── resources/                  # Templates, configs
```

**Avantages :**
- Claude charge dynamiquement les skills pertinents
- Réutilisable et composable
- Testable indépendamment
- Documentation intégrée

---

## 4. Workflow MVP - Priority Detector

### Étape 1 : Utilisateur lance commande
```bash
$ nexus priorities today
🔍 Analysing Limitless lifelogs...
```

### Étape 2 : Fetch Limitless
```python
# Période : aujourd'hui (00:00 → maintenant)
lifelogs = limitless.search_with_transcripts(
    date="2024-10-23",
    limit=10
)
```

### Étape 3 : Analyse avec Claude + priority-detector skill
```python
response = anthropic.messages.create(
    model="claude-sonnet-4-5-20250929",
    container={
        "skills": [{
            "type": "custom",
            "skill_id": "priority-detector",
            "version": "latest"
        }]
    },
    messages=[{
        "role": "user",
        "content": f"""
        Analyse ces lifelogs et extrait les priorités :
        
        Critères :
        - Engagements pris par Christian
        - Demandes reçues de clients/prospects
        - Deadlines mentionnés
        
        Lifelogs :
        {lifelogs_transcript}
        
        Format : Liste markdown avec checkboxes
        """
    }]
)
```

### Étape 4 : Création TODOs Notion
```python
for priority in extracted_priorities:
    notion.create_page(
        parent={"database_id": TODO_DB_ID},
        properties={
            "Titre": priority.title,
            "Type": priority.type,  # engagement/demande/deadline
            "Date": priority.date,
            "Statut": "À faire"
        }
    )
```

### Étape 5 : Output
```markdown
✅ 5 priorités détectées
✅ 5 TODOs créés dans Notion

🎯 Priorités du jour - 23 octobre 2024
[...liste markdown...]

🔗 Voir dans Notion : https://notion.so/...
```

---

## 5. Configuration & Setup

### Variables d'environnement requises
```yaml
# config/config.yaml (gitignored)
limitless:
  api_key: "lim_xxxxxxxxxxxx"
  
notion:
  token: "secret_xxxxxxxxxxxx"
  todo_database_id: "xxxxx-xxxxx-xxxxx"
  crm_database_id: "xxxxx-xxxxx-xxxxx"
  
anthropic:
  api_key: "sk-ant-xxxxxxxxxxxx"
  model: "claude-sonnet-4-5-20250929"
```

### Installation
```bash
# Clone repo
git clone https://github.com/chrisboulet/Nexus.git
cd Nexus

# Install dependencies
pip install -r requirements.txt

# Configure
cp config/config.example.yaml config/config.yaml
# Éditer config.yaml avec tes API keys

# Run
python src/nexus_cli.py priorities today
```

---

## 6. Roadmap par Phases

### ✅ Phase 0 : Foundation (Maintenant)
- [ ] Créer structure repo GitHub
- [ ] Setup environnement Python + dependencies
- [ ] Configurer API keys (Limitless, Notion, Anthropic)

### 🎯 Phase 1 : MVP Priority Detector (Semaine 1)
**Objectif :** Détection priorités + TODOs Notion

- [ ] Créer skill `priority-detector/`
- [ ] Implémenter `limitless_api.py` (fetch lifelogs)
- [ ] Implémenter `notion_todo.py` (create TODOs)
- [ ] Créer CLI `nexus priorities today|week`
- [ ] Tester avec données réelles Christian
- [ ] Documenter README.md

**Critère de succès :** Christian peut lancer `nexus priorities today` chaque matin et obtenir sa liste de priorités en < 30 sec.

### 🚀 Phase 2 : Lead Researcher (Semaine 2-3)
**Objectif :** Recherche automatique nouveaux leads

- [ ] Créer skill `lead-researcher/`
- [ ] Implémenter recherche web + scraping
- [ ] Analyse fit avec offre Boulet Stratégies
- [ ] Création automatique CRM Notion
- [ ] CLI `nexus lead "Nom Entreprise"`

### 🔮 Phase 3 : Calendar Integration (Semaine 4+)
**Objectif :** Sync Google Calendar

- [ ] Créer skill `calendar-sync/`
- [ ] Détection meetings à préparer
- [ ] Suggestions follow-ups post-meeting
- [ ] Block time pour priorités identifiées

### 🤖 Phase 4 : Agent Autonome (Future)
**Objectif :** Mode automatique en background

- [ ] Daemon qui tourne en continu
- [ ] Monitoring lifelogs en temps réel
- [ ] Notifications push (Slack/Email)
- [ ] Suggestions proactives

---

## 7. Principes de Design

### Keep It Simple, Stupid (KISS)
- CLI direct, pas de webapp complexe (pour l'instant)
- Markdown > JSON pour outputs humains
- Fichier config unique et clair

### Fail Fast, Learn Faster
- Logs verbeux pour debugging
- Dry-run mode (`--dry-run`) pour tester sans créer dans Notion
- Erreurs explicites avec suggestions de fix

### ENTP-Friendly (pour Christian)
- **Tenacity support :** Rappels automatiques des TODOs créés
- **Execution focus :** Résultats en < 30 sec, pas de friction
- **Invention playground :** Architecture modulaire pour expérimenter

### Data Privacy
- Toutes les données restent chez Christian (pas de cloud tiers)
- Config sensible gitignorée
- Option de masquer infos sensibles dans logs

---

## 8. Métriques de Succès

### Phase 1 (MVP)
- ✅ **Adoption :** Christian utilise `nexus priorities` 5 jours / 7
- ✅ **Précision :** > 90% des priorités détectées sont pertinentes
- ✅ **Performance :** < 30 secondes d'exécution
- ✅ **Impact :** Réduction 50% du temps "qu'est-ce que je dois faire aujourd'hui?"

### Phase 2+
- **Pipeline :** 2+ nouveaux leads qualifiés / semaine via `nexus lead`
- **Conversion :** Au moins 1 lead NEXUS → client payant
- **ROI temps :** 5h / semaine économisées en admin/suivi

---

## 9. Risques & Mitigation

### Risque : Trop de faux positifs (priorités non pertinentes)
**Mitigation :**
- Fine-tuning des prompts priority-detector
- Feedback loop : Christian marque priorités incorrectes
- Ajuster seuil de confiance Claude

### Risque : APIs rate limits (Limitless / Notion)
**Mitigation :**
- Caching intelligent des lifelogs
- Batch requests quand possible
- Exponential backoff sur erreurs

### Risque : Christian n'utilise pas l'outil (ENTP Tenacity)
**Mitigation :**
- Intégration dans routine matinale (hook avec café ☕)
- Notifications Slack si pas utilisé depuis 2 jours
- Gamification : stats d'utilisation hebdo

---

## 10. Next Steps Immédiats

### Pour Christian (avant de donner à Claude Code)
1. ✅ Créer repo GitHub `chrisboulet/Nexus` (FAIT)
2. [ ] Obtenir API keys :
   - Limitless : https://limitless.ai/developers
   - Notion : https://www.notion.so/my-integrations
   - Anthropic : https://console.anthropic.com/
3. [ ] Identifier Notion database ID pour TODOs
4. [ ] Tester fetch manuel Limitless pour valider données

### Pour Claude Code (développement)
1. [ ] Setup structure repo selon architecture ci-dessus
2. [ ] Créer `priority-detector/SKILL.md` avec instructions
3. [ ] Implémenter `limitless_api.py` wrapper
4. [ ] Implémenter `notion_todo.py` wrapper
5. [ ] Créer CLI `nexus priorities today`
6. [ ] Tests avec données Christian
7. [ ] Documentation README

---

## 11. Ressources & Références

### APIs Documentation
- **Limitless API :** https://limitless.ai/developers/docs/api
- **Limitless Examples :** https://github.com/limitless-ai-inc/limitless-api-examples
- **Notion API :** https://developers.notion.com/reference/intro
- **Anthropic Claude :** https://docs.anthropic.com/
- **Anthropic Skills :** https://github.com/anthropics/skills

### Inspirations
- Anthropic Skills Pattern : https://github.com/anthropics/claude-cookbooks/tree/main/skills
- Custom Skills Guide : https://docs.claude.com/en/docs/agents-and-tools/agent-skills

### Contact
- **Propriétaire :** Christian Boulet
- **Email :** christian@bouletstrategies.ca
- **GitHub :** https://github.com/chrisboulet/Nexus

---

**🚀 Let's build NEXUS !**

*Document vivant - Dernière mise à jour : 23 octobre 2024*
