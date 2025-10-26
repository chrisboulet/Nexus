# Workflow Quotidien NEXUS
## Votre Système Automatisé Ultra-Simple

**Version:** 2.0 (100% Automatique)
**Pour:** Christian Boulet - Boulet Stratégies TI

---

## 🎯 La Promesse

**Vous parlez. NEXUS s'occupe du reste.**

Plus besoin de:
- ❌ Prendre des notes pendant les appels
- ❌ Copier-coller entre outils
- ❌ Faire des revues quotidiennes manuelles
- ❌ Oublier ce que vous avez promis

---

## 🔄 Comment Ça Marche (Automatiquement)

### Votre Journée Type

```
9h00   📞 Appel avec prospect Marc (ESI)
       → "Je te reviens avec une proposition cette semaine"
       → Limitless enregistre automatiquement

9h30   🤖 NEXUS analyse (cron toutes les 30 min)
       → Détecte l'engagement
       → Crée task dans Google Tasks

10h00  📱 Vous ouvrez Google Tasks
       → 💻 Préparer proposition CTO pour Marc Veilleux (ESI) [1h]
       → Source: Conversation du 26 janvier 9h00

       ✨ La tâche est déjà là!
```

---

## 📅 Votre Routine Simplifiée

### 🌅 Le Matin (5 minutes)

```
1. Ouvrir Google Tasks
2. Voir vos priorités du jour (déjà créées par NEXUS!)
3. Time-block dans Google Calendar si besoin
4. GO!
```

**C'est tout.** Pas de commande à lancer, pas de sync manuelle.

---

### 📝 Pendant la Journée

```
- Avoir des conversations (téléphone, Zoom, présentiel)
- Limitless enregistre automatiquement
- Continuer votre vie

NEXUS analyse toutes les 30 minutes en arrière-plan:
  → 9h30
  → 10h00
  → 10h30
  → ... jusqu'à 19h00

Si nouvelles priorités détectées → Google Tasks automatiquement
```

**Vous ne faites RIEN. Tout est automatique.**

---

### 📊 Vendredi Après-Midi (15 minutes)

```
14h00  🤖 NEXUS Weekly Sync (automatique)
       → Analyse toutes les conversations de la semaine
       → Met à jour votre CRM Notion:
           • Nouveaux leads détectés
           • Clients à suivre
           • Projets mentionnés

14h15  📖 Vous ouvrez Notion
       → Voir les nouveaux leads de la semaine
       → Réviser le pipeline
       → Planifier la semaine prochaine
```

---

## 📱 Où Sont Vos Données?

### Google Tasks = Vos Actions du Jour/Semaine

Ouvrez Google Tasks (web ou mobile):

```
📋 NEXUS - Priorités

📞 Rappeler Guy Tremblay (case studies IA) [15min]
   Source: Conversation LinkedIn du 25 janvier
   Contexte: @appels

💻 Préparer proposition Fractional CTO pour Marc Veilleux [2h+]
   Source: Appel téléphonique du 26 janvier 9h00
   Contexte: @ordi
   Deadline: Cette semaine

📅 Bloquer 1-1 avec JF Poulin [5min]
   Source: Email du 24 janvier
   Contexte: @agenda
```

### Notion = Votre Vision Stratégique

Ouvrez Notion (vendredi PM ou quand vous voulez):

**Database: Leads**
| Nom | Entreprise | Statut | Dernière interaction | Prochaine action |
|-----|------------|--------|---------------------|------------------|
| Marc Veilleux | ESI Technologies | 🔥 Chaud | 26 janvier | Envoyer proposition CTO |
| Guy Tremblay | InnovIA | 🟡 Tiède | 25 janvier | Partager case studies |

**Database: Clients Actifs**
| Nom | Mandat | Statut | Prochaine livraison |
|-----|--------|--------|---------------------|
| FLB | Architecture cloud | 🟢 Actif | Documentation architecture |

**Database: Projets**
| Projet | Client | Statut | Next Action | Deadline |
|--------|--------|--------|-------------|----------|
| Migration AWS | ABC Corp | 🔵 Actif | Planifier phase 1 | 15 février |

---

## 🤖 Ce Que NEXUS Fait Automatiquement

### Toutes les 30 Minutes (7h AM - 7h PM)

1. ✅ Vérifie les nouvelles conversations Limitless
2. ✅ Analyse avec Claude (IA)
3. ✅ Détecte: engagements, demandes, deadlines
4. ✅ Élimine les duplicatas (smart!)
5. ✅ Crée les tasks dans Google Tasks
6. ✅ Assigne contexte (@appels, @ordi) et durée
7. ✅ Logs tout pour monitoring

**Vous:** Zéro action requise ☕

### Chaque Vendredi 14h

1. ✅ Analyse toute la semaine de conversations
2. ✅ Identifie nouveaux leads/prospects
3. ✅ Détecte mises à jour clients
4. ✅ Trouve nouveaux projets mentionnés
5. ✅ Met à jour Notion CRM automatiquement

**Vous:** Juste réviser le résultat 15 min

---

## 📊 Tableaux de Bord

### Dashboard Supabase (pour les geeks)

Voir en temps réel:
- Derniers syncs exécutés
- Nombre de priorités détectées
- Tasks créées
- Erreurs s'il y en a

**URL:** https://app.supabase.com/project/YOUR_PROJECT

### Logs (si besoin de debugger)

SQL query dans Supabase:

```sql
-- Dernières 10 exécutions
SELECT
  sync_type,
  status,
  tasks_created,
  created_at
FROM sync_logs
ORDER BY created_at DESC
LIMIT 10;
```

---

## ⚡ Cas d'Usage Réels

### Scénario 1: Appel Client Urgent

```
9h15   📞 Appel FLB: "Il me faut la doc architecture avant vendredi"
9h30   🤖 NEXUS analyse
       ✅ Task créée: "Documenter architecture FLB [2h+] - Deadline: Vendredi"
9h40   📱 Vous voyez la task dans Google Tasks
       → Vous bloquez temps dans Calendar
       → Vous livrez à temps
```

### Scénario 2: Lead Chaud

```
Lundi  📧 Email prospect: "On peut se parler cette semaine?"
Mardi  📞 Appel: Très intéressé, veut proposition
       🤖 NEXUS crée task: "Préparer proposition XYZ [2h+]"
Vendredi 14h 🤖 NEXUS weekly sync
       → Crée lead dans Notion: "XYZ Corp - 🔥 Chaud"
       → Notes: "Intéressé fractional CTO, budget confirmé"
Vendredi 14h15 📖 Vous voyez le lead dans Notion
       → Vous priorisez pour semaine prochaine
```

### Scénario 3: Engagement Vague

```
Conversation: "On devrait se reparler de ça bientôt"
🤖 NEXUS: Confiance 0.4 (trop vague)
       → PAS de task créée (smart filtering!)
```

---

## 🎯 Les 3 Règles d'Or

### 1. Limitless Doit Tourner

- ✅ Pendant vos appels
- ✅ Pendant vos meetings
- ✅ Pendant vos discussions

**Si Limitless n'enregistre pas → NEXUS n'a rien à analyser**

### 2. Soyez Explicite Dans Vos Engagements

**BON:**
- "Je t'envoie une proposition d'ici vendredi"
- "Je te reviens avec mon calendrier cette semaine"

**VAGUE (NEXUS va skip):**
- "On se reparle bientôt"
- "Faut qu'on regarde ça un jour"

### 3. Vérifiez Google Tasks Matin + Midi

- Matin: Planifier votre journée
- Midi: Voir ce qui s'est ajouté depuis ce matin

(C'est pas obligatoire, mais ça aide!)

---

## 🚨 Troubleshooting Rapide

### "Aucune task créée depuis 2 jours"

**Checklist:**
1. Avez-vous eu des conversations? (Limitless enregistre?)
2. Avez-vous pris des engagements explicites?
3. Vérifier Supabase Dashboard → sync_logs

### "Tasks en double dans Google Tasks"

**Cause:** Déduplication a échoué (rare)

**Fix:**
1. Supprimer les doublons manuellement
2. Vérifier table `priorities_cache` dans Supabase

### "NEXUS a manqué un engagement important"

**Solutions:**
1. Ajouter manuellement la task dans Google Tasks
2. Améliorer le prompt Claude (nous contacter)
3. Être plus explicite dans vos engagements

---

## 💡 Astuces Pro

### Utiliser les Contextes

NEXUS assigne automatiquement:
- 📞 **@appels** → Tâches de communication
- 💻 **@ordi** → Travail ordinateur
- 📅 **@agenda** → Meetings à booker
- ⏳ **@attente** → En attente de quelqu'un d'autre

**Filtrez par contexte dans Google Tasks!**

### Time-Blocking Intelligent

1. Regarder les durées estimées par NEXUS
2. Bloquer des blocs de 90 min dans Calendar
3. Assigner 2-3 tasks par bloc

### Revue Hebdo Notion (Vendredi PM)

15 minutes pour:
- ✅ Réviser nouveaux leads
- ✅ Identifier follow-ups manquants
- ✅ Planifier semaine prochaine

---

## 🎉 Résultat Final

**Avant NEXUS:**
- 😰 Stress de tout retenir
- 📝 Notes éparpillées
- ❌ Engagements oubliés
- ⏰ Temps perdu en admin

**Avec NEXUS:**
- ✅ Peace of mind
- ✅ Rien ne se perd
- ✅ Tout est dans Google Tasks automatiquement
- ✅ CRM à jour sans effort
- ⏱️ 5 min le matin, c'est tout!

---

## 📞 Support

**Problème technique?**
→ Vérifier `docs/Architecture.md`
→ Consulter logs Supabase

**Amélioration du système?**
→ Noter dans Notion "NEXUS Improvements"
→ Réviser mensuellement

---

**"La simplicité est la sophistication ultime."**
— Votre système fonctionne maintenant tout seul 🚀

---

**Dernière mise à jour:** 26 janvier 2025
