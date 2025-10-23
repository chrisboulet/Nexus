# 🎯 NEXUS

**AI-Powered Priority Assistant**
Strategic Coordination & Unified Tracking for Boulet Stratégies TI

## Vision

En tant que fractional CTO solo, Christian jongle entre multiples conversations prospects/clients enregistrées dans Limitless. **NEXUS analyse automatiquement ces lifelogs, extrait les priorités, et transforme ça en actions concrètes dans Notion.**

Commencez chaque journée en sachant exactement quoi faire, sans avoir à relire vos notes.

## ✨ Fonctionnalités MVP (Phase 1)

### 🔍 Priority Detector

NEXUS détecte automatiquement dans vos conversations Limitless :

- ✅ **Engagements pris** : "je vais te revenir avec une proposition"
- ✅ **Demandes reçues** : "peux-tu m'envoyer ton CV?"
- ✅ **Deadlines** : "il me faut ça avant vendredi"

### 🤖 Powered by Claude Sonnet 4.5

Analyse intelligente via Anthropic Claude pour une précision > 90%

### 📝 Création Automatique de TODOs

Les priorités détectées sont automatiquement créées dans votre base Notion avec :
- Type (engagement/demande/deadline)
- Description et contexte
- Source de la conversation
- Score de confiance

## 🚀 Quickstart

### Installation

```bash
# Clone le repo
git clone https://github.com/chrisboulet/Nexus.git
cd Nexus

# Installe les dépendances
pip install -r requirements.txt

# Configure tes API keys
cp config/config.example.yaml config/config.yaml
# Édite config/config.yaml avec tes clés API
```

### Configuration

Édite `config/config.yaml` :

```yaml
limitless:
  api_key: "lim_xxxxxxxxxxxx"

notion:
  token: "secret_xxxxxxxxxxxx"
  todo_database_id: "xxxxx-xxxxx-xxxxx"

anthropic:
  api_key: "sk-ant-xxxxxxxxxxxx"
  model: "claude-sonnet-4-5-20250929"
```

### Usage

```bash
# Priorités du jour
./nexus priorities today

# Priorités de la semaine
./nexus priorities week

# Mode test (n'écrit pas dans Notion)
./nexus priorities today --dry-run
```

## 📊 Exemple d'Output

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
⏱️  Temps d'exécution : 12.3s
```

## 🏗️ Architecture

```
nexus/
├── skills/
│   └── priority-detector/        # ⭐ MVP Phase 1
│       ├── SKILL.md              # Instructions Claude
│       ├── scripts/              # Logique d'analyse
│       └── resources/            # Prompt templates
│
├── src/
│   ├── nexus_cli.py              # CLI principal
│   ├── connectors/               # API Wrappers
│   │   ├── limitless.py          # Limitless API
│   │   ├── notion.py             # Notion API
│   │   └── claude.py             # Anthropic API
│   └── utils/
│       └── config.py             # Configuration
│
├── config/
│   └── config.yaml               # API keys (gitignored)
│
└── tests/
```

## 🔑 API Keys Requises

1. **Limitless** : https://limitless.ai/developers
2. **Notion** : https://www.notion.so/my-integrations
3. **Anthropic** : https://console.anthropic.com/

## 📚 Documentation

- **[Blueprint.md](Blueprint.md)** : Vision complète et roadmap
- **[SKILL.md](skills/priority-detector/SKILL.md)** : Documentation du skill priority-detector
- **[CHANGELOG.md](CHANGELOG.md)** : Historique des versions

## 🎯 Critères de Succès MVP

- ✅ Temps d'exécution < 30 secondes
- ✅ Précision > 90% (pas de faux positifs critiques)
- ✅ 100% des priorités détectées créées dans Notion

## 🗺️ Roadmap

### ✅ Phase 1 : MVP Priority Detector (Semaine 1)
**Status :** ✅ Implémenté
- [x] Détection priorités quotidiennes/hebdomadaires
- [x] Analyse IA avec Claude
- [x] Création automatique TODOs Notion
- [x] CLI `nexus priorities today|week`

### 🚀 Phase 2 : Lead Researcher (Semaine 2-3)
- [ ] Recherche automatique nouveaux leads
- [ ] Analyse fit avec offre Boulet Stratégies
- [ ] Création automatique CRM Notion
- [ ] CLI `nexus lead "Nom Entreprise"`

### 🔮 Phase 3 : Calendar Integration (Semaine 4+)
- [ ] Sync Google Calendar
- [ ] Détection meetings à préparer
- [ ] Suggestions follow-ups post-meeting

### 🤖 Phase 4 : Agent Autonome (Future)
- [ ] Mode automatique en background
- [ ] Monitoring lifelogs en temps réel
- [ ] Notifications proactives

## 🛠️ Développement

### Installer en mode dev

```bash
pip install -r requirements.txt
pip install -e .
```

### Lancer les tests

```bash
pytest tests/
```

### Logs

Consultez `nexus.log` pour le debug détaillé.

## 🔒 Sécurité

- Toutes les données restent locales
- Configuration sensible gitignorée
- Pas de cloud tiers
- Authentification via API keys

## 📝 License

MIT License - Voir [LICENSE](LICENSE)

## 👤 Auteur

**Christian Boulet**
Fractional CTO - Boulet Stratégies TI

- Email : christian@bouletstrategies.ca
- GitHub : [@chrisboulet](https://github.com/chrisboulet)

---

**🚀 Built with Claude Code**

*Version 0.1.0 - MVP Phase 1 Complete*
