# Système de Productivité Hybride
## Google Workspace + Notion : GTD × 4DX × CORE

**Créé le :** 2025-10-26
**Pour :** Christian Boulet - Boulet Stratégies TI

---

## 📊 Analyse des Méthodologies

### GTD (Getting Things Done)
**Principes clés :**
- **Capturer** tout ce qui attire votre attention
- **Clarifier** ce que ça signifie et ce qu'il faut faire
- **Organiser** dans des catégories appropriées
- **Réfléchir** (révision hebdomadaire)
- **S'engager** (faire le travail)

**Forces :** Gestion exhaustive, peace of mind, rien ne se perd

### 4DX (4 Disciplines of Execution)
**Les 4 disciplines :**
1. **Focus sur 1-2 WIGs** (Wildly Important Goals)
2. **Agir sur les Lead Measures** (indicateurs prédictifs et influençables)
3. **Tableau de bord visible** (scoreboard engageant)
4. **Cadence de responsabilité** (réunions régulières, commitments)

**Forces :** Focus stratégique, mesures actionnables, momentum

### CORE (Jeff Su)
**Les 4 étapes :**
- **C**apture : Tout capturer instantanément
- **O**rganize : Organiser avec zéro friction
- **R**eview : Réviser sur calendrier fixe
- **E**ngage : Bloquer du temps dédié

**Forces :** Systèmes > volonté, simplicité, habitudes durables

---

## 🎯 Principes de Conception du Système Hybride

### 1. Vous au Centre
- **Vous êtes le cerveau**, les outils sont les membres
- Décisions humaines, exécution assistée
- Revues actives, non automatiques

### 2. Chaque Outil Fait Ce Qu'il Fait de Mieux

**Google Workspace = Le Flux & L'Action**
- ✅ Capture rapide (Gmail, Tasks, Calendar)
- ✅ Communication temps réel
- ✅ Time-blocking et engagement quotidien
- ✅ Collaboration avec clients/équipe
- ✅ Accessibilité mobile parfaite

**Notion = La Structure & La Vision**
- ✅ Vue d'ensemble stratégique
- ✅ Projets et contextes structurés
- ✅ Relations complexes (clients ↔ projets ↔ tâches)
- ✅ Archives et knowledge base
- ✅ Dashboards et reporting

### 3. Simplicité Radicale
- Pas de sur-ingénierie
- Règles claires et mémorisables
- Friction minimale pour capturer
- Revues ritualisées (pas quotidiennes)

---

## 🏗️ Architecture du Système

```
┌─────────────────────────────────────────────────────────────┐
│                    GOOGLE WORKSPACE                          │
│                  (Capture & Engagement)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📧 Gmail              → Capture immédiate                   │
│  📅 Calendar           → Time-blocking & Engagement          │
│  ✓ Google Tasks        → Next Actions du jour               │
│  📝 Google Docs        → Notes de réunion collaboratives     │
│                                                              │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ Flux quotidien
                  │
                  ↓
┌─────────────────────────────────────────────────────────────┐
│                        NOTION                                │
│              (Organisation & Stratégie)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🎯 WIGs & OKRs        → 1-2 objectifs trimestriels          │
│  📊 Lead Measures      → Indicateurs hebdomadaires           │
│  📋 Projets            → Liste maître + statuts              │
│  👤 Clients/Leads      → CRM léger                           │
│  📚 Contextes          → @ordi, @appels, @agenda, @attente   │
│  🗃️ Someday/Maybe      → Idées et opportunités               │
│  📖 Knowledge Base     → Documentation et templates          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Mécanique Opérationnelle

### 🌅 Routine Matinale (15 min)
**Lieu : Google Calendar + Google Tasks**

1. **Ouvrir Google Calendar** → Voir les rendez-vous du jour
2. **Exécuter `nexus priorities today`** → Voir les priorités Limitless
3. **Consulter Google Tasks** → Voir les Next Actions du jour
4. **Time-blocking** :
   - Bloquer 2-3 blocs de Deep Work (90 min chacun)
   - Assigner 3-5 tâches max aux blocs
   - Garder 30% du temps libre (imprévus)

**Output :** Journée planifiée, focus clair

---

### 📥 Capture Continue (Toute la journée)
**Règle d'Or : Capturer en < 30 secondes**

| Quoi ? | Où le capturer ? | Quand l'organiser ? |
|--------|------------------|---------------------|
| Email nécessitant action | ⭐ Star dans Gmail | Revue quotidienne 16h |
| Idée/tâche rapide | Google Tasks (mobile) | Revue quotidienne 16h |
| Engagement verbal (appel) | Limitless → NEXUS auto | Revue matinale |
| Demande client urgente | Google Tasks + flag urgent | Immédiat |
| Note de réunion | Google Doc partagé | Fin de réunion |
| Idée de projet | Google Tasks → tag "someday" | Revue hebdomadaire |

**Principe CORE :** Capture instantanée, friction zéro

---

### 🔄 Revue Quotidienne (16h - 15 min)
**Lieu : Google Tasks → Notion**

**Objectif :** Vider les boîtes de réception, organiser pour demain

1. **Traiter Google Tasks** (10 min) :
   - Pour chaque item : C'est quoi ? Actionnable ? Projet ?
   - Si < 2 min → Faire immédiatement
   - Si tâche → Garder dans Google Tasks avec contexte (@ordi, @appels)
   - Si projet → Créer dans Notion Projets
   - Si attente → Transférer dans Notion @attente
   - Si someday → Transférer dans Notion Someday/Maybe

2. **Traiter Starred Emails** (5 min) :
   - Même logique que Tasks
   - Retirer les étoiles après traitement
   - Créer tâche dans Google Tasks si nécessaire

3. **Préparer demain** :
   - Ajouter 3-5 Next Actions dans Google Tasks pour demain
   - Regarder Calendar pour contexte

**Output :** Boîtes de réception vides, demain préparé

---

### 🗓️ Revue Hebdomadaire (Vendredi 14h - 60 min)
**Lieu : Notion (vue d'ensemble) + Google Calendar**

**Objectif :** Réconcilier flux et structure, aligner tactique et stratégie

#### Phase 1 : COLLECT (10 min)
- Vider toutes les poches restantes
- Traiter notes papier, post-its, screenshots
- Mettre à jour Notion avec nouvelles infos clients

#### Phase 2 : REVIEW (30 min)

**A. Projets Actifs** (15 min)
- Pour chaque projet dans Notion :
  - Status à jour ? (En cours / Bloqué / Complété)
  - Next Action définie ?
  - Attente de quelqu'un ?
  - Si bloqué → Identifier débloqueur
  - Si complété → Archiver + célébrer 🎉

**B. Lead Measures & WIGs** (10 min)
- Consulter le scoreboard des Lead Measures
- Actualiser les chiffres de la semaine
- Est-on on track pour les WIGs ?
- Ajustements nécessaires ?

**C. Contextes** (5 min)
- @attente : Follow-up nécessaire ?
- @appels : Qui appeler la semaine prochaine ?
- @agenda : Quoi discuter en 1-1 ?

#### Phase 3 : PLAN (20 min)

**A. Identifier 3 Big Wins pour la semaine prochaine** (5 min)
- Alignés avec WIGs
- 1 par domaine : Business Dev / Delivery / Personnel

**B. Time-block la semaine** (10 min)
- Bloquer Deep Work dans Google Calendar
- Bloquer Admin time (emails, calls)
- Bloquer Review times

**C. Charger Google Tasks** (5 min)
- Extraire 10-15 Next Actions depuis Notion
- Les mettre dans Google Tasks pour la semaine
- Prioriser avec contextes

**Output :** Vision claire, semaine planifiée, alignement stratégique

---

### 📈 Revue Mensuelle (Dernier vendredi - 90 min)
**Lieu : Notion Dashboard**

**Objectif :** Mesurer progrès, ajuster stratégie, célébrer gains

1. **Review WIGs** (20 min) :
   - Progrès vers objectifs trimestriels ?
   - Lead Measures efficaces ?
   - Obstacles récurrents ?

2. **Review Clients/Leads** (20 min) :
   - Pipeline santé ?
   - Follow-ups nécessaires ?
   - Opportunités dormantes ?

3. **Review Projets** (15 min) :
   - Projets stagnants → Décision (tuer ou ressusciter)
   - Patterns de blocage ?
   - Learnings ?

4. **Review Someday/Maybe** (15 min) :
   - Idées à activer ?
   - Idées à abandonner ?

5. **Ajustements** (20 min) :
   - WIGs encore pertinents ?
   - Lead Measures à changer ?
   - Système à optimiser ?

**Output :** Dashboard mis à jour, décisions stratégiques, clarté renouvelée

---

## 🗄️ Structure Notion

### Base de Données 1 : WIGs & Lead Measures
**Propriétés :**
- Nom (text)
- Type (select: WIG / Lead Measure)
- Période (date range: Q1 2025, etc.)
- Target (number)
- Actuel (number)
- Status (formula: % completion)
- Notes (rich text)

**Vue par défaut :** Scoreboard visuel (progress bars)

---

### Base de Données 2 : Projets
**Propriétés :**
- Nom (title)
- Client/Lead (relation → DB Clients)
- Status (select: 🔵 Actif / 🟡 Attente / ✅ Complété / ⚪ Someday)
- Next Action (text)
- Deadline (date)
- WIG lié (relation → DB WIGs)
- Notes (rich text)

**Vues :**
- Kanban par Status
- Table groupée par Client
- Calendar par Deadline
- Timeline (Gantt)

**Règle d'Or :** Chaque projet actif DOIT avoir une Next Action

---

### Base de Données 3 : Clients & Leads
**Propriétés :**
- Nom (title)
- Type (select: Client / Prospect / Partenaire)
- Statut (select: 🔥 Chaud / 🟢 Actif / 🟡 Tiède / ⚪ Froid)
- Dernière interaction (date)
- Prochaine action (text)
- Projets liés (relation → DB Projets)
- Revenue potentiel (number)
- Notes (rich text)

**Vues :**
- Pipeline Kanban
- Table triée par dernière interaction
- Calendar des follow-ups

---

### Base de Données 4 : Contextes & Next Actions
**Propriétés :**
- Action (title)
- Projet (relation → DB Projets)
- Contexte (select: @ordi / @appels / @agenda / @attente / @courses)
- Priorité (select: 🔴 Haute / 🟡 Moyenne / 🟢 Basse)
- Énergie (select: 🧠 Haute / 💪 Moyenne / 😴 Basse)
- Temps estimé (select: 5min / 15min / 30min / 1h / 2h+)
- Date ajoutée (created time)

**Vues :**
- Liste groupée par Contexte
- Filtre @attente (Waiting For)
- Filtre par Énergie (quand fatigué)

**Note :** Cette DB est une "staging area" - les Next Actions du jour sont copiées dans Google Tasks

---

### Base de Données 5 : Someday/Maybe
**Propriétés :**
- Idée (title)
- Catégorie (select: 📚 Formation / 💡 Projet / 🚀 Opportunité / 🛠️ Outil)
- Pourquoi intéressant ? (text)
- Date ajoutée (created time)
- Review (checkbox)

**Vue :** Table triée par date (les plus récentes en haut)

---

## 📋 Dashboards Notion

### 1️⃣ Daily Dashboard (Vue rapide)
- WIGs progress bars
- Projets actifs (statut)
- @attente items
- Prochains rendez-vous (embed Google Calendar)

### 2️⃣ Weekly Dashboard (Revue hebdo)
- Lead Measures chart
- Projets par statut (Kanban)
- Pipeline clients (par statut)
- Next Actions par contexte

### 3️⃣ Monthly Dashboard (Vue stratégique)
- WIGs timeline
- Revenue pipeline
- Projets complétés ce mois
- Time spent par catégorie

---

## 🔄 Flux d'Intégration Google ↔ Notion

### Google → Notion (Hebdomadaire)
**Moment :** Revue hebdomadaire

- Google Tasks → Notion Next Actions (manuel, copier-coller)
- Google Calendar events → Mise à jour projets
- Google Docs notes → Enrichir pages clients Notion

### Notion → Google (Hebdomadaire)
**Moment :** Revue hebdomadaire

- Notion Next Actions → Google Tasks (10-15 items)
- Notion projets deadlines → Google Calendar (time-blocks)
- Notion @agenda items → Google Docs agenda réunions

### NEXUS → Notion (Quotidien)
**Moment :** Revue matinale

- `nexus priorities today` → Google Tasks immédiat
- Revue quotidienne 16h → Transférer dans Notion si projet/attente

---

## 🎯 Application des 4 Disciplines

### Discipline 1 : Focus sur les WIGs
- **Règle :** Max 2 WIGs actifs par trimestre
- **Exemples :**
  - WIG 1 : Signer 2 mandats CTO fractionnel (100k+ ARR) avant fin Q1
  - WIG 2 : Publier 12 articles LinkedIn à haute valeur avant fin Q1

### Discipline 2 : Agir sur les Lead Measures
**Pour chaque WIG, définir 2-3 Lead Measures :**

**Exemple WIG 1 :**
- Lead Measure A : 5 conversations qualifiées / semaine
- Lead Measure B : 2 propositions envoyées / semaine

**Exemple WIG 2 :**
- Lead Measure A : 3 heures d'écriture / semaine (time-blocked)
- Lead Measure B : 5 commentaires engageants sur posts tiers / semaine

**Principe :** Les Lead Measures sont prédictives ET influençables

### Discipline 3 : Tableau de bord visible
- **Outil :** Notion Dashboard "WIGs & Leads"
- **Fréquence :** Consulté chaque revue hebdo
- **Visualisation :** Progress bars + line charts
- **Couleurs :**
  - 🟢 Vert : On track
  - 🟡 Jaune : À risque
  - 🔴 Rouge : Off track

### Discipline 4 : Cadence de responsabilité
**Auto-accountability (solo):**
- **Revue hebdomadaire** = votre "WIG session"
- **Questions à répondre :**
  1. Ai-je atteint mes Lead Measures cette semaine ?
  2. Quels obstacles ont empêché le progrès ?
  3. Quels commitments pour la semaine prochaine ?

**Accountability externe (optionnel):**
- Partager WIG progress avec un accountability partner
- Call mensuel de 30 min
- Partage de scoreboard

---

## 🚀 Plan d'Implémentation (Phase par Phase)

### Phase 0 : Setup (1 semaine)
**Actions :**
1. ✅ Créer structure Notion (5 DBs + 3 Dashboards)
2. ✅ Définir 1-2 WIGs pour Q1 2025
3. ✅ Identifier Lead Measures pour chaque WIG
4. ✅ Migrer projets actuels dans Notion
5. ✅ Configurer Google Tasks avec labels contextes
6. ✅ Bloquer les revues dans Google Calendar (récurrentes)

**Output :** Système prêt à l'emploi

---

### Phase 1 : Adoption Flux Quotidien (2 semaines)
**Focus :** Maîtriser Capture + Engagement

**Pratiques à installer :**
- ✅ Routine matinale (15 min)
- ✅ Capture dans Google Tasks (toute la journée)
- ✅ Time-blocking dans Calendar
- ✅ Revue quotidienne 16h (15 min)

**Métriques de succès :**
- 10/10 routines matinales exécutées
- 10/10 revues quotidiennes exécutées
- Google Tasks vidé chaque soir
- Inbox zéro Gmail (starred items)

**Difficulté attendue :** Moyenne (nouvelles habitudes)

---

### Phase 2 : Adoption Revue Hebdomadaire (4 semaines)
**Focus :** Maîtriser la boucle stratégique

**Pratiques à installer :**
- ✅ Revue hebdomadaire vendredi (60 min, non négociable)
- ✅ Mise à jour Lead Measures dans Notion
- ✅ Planification des 3 Big Wins

**Métriques de succès :**
- 4/4 revues hebdo complétées
- Lead Measures trackés toutes les semaines
- Projets Notion à jour (statuts + next actions)

**Difficulté attendue :** Élevée (demande discipline)

---

### Phase 3 : Optimisation (En continu)
**Focus :** Affiner le système selon apprentissages

**Questions à explorer :**
- Les Lead Measures sont-ils vraiment prédictifs ?
- Les contextes sont-ils utiles ?
- Le temps de revue est-il trop long/court ?
- Y a-t-il des frictions inutiles ?

**Principe :** Kaizen (amélioration continue)

---

## 🎓 Principes de Durabilité

### 1. Commencer Minimal
- Semaine 1-2 : Juste capture + Google Tasks
- Semaine 3-4 : Ajouter revue quotidienne
- Semaine 5+ : Ajouter Notion + revue hebdo

### 2. Systèmes > Volonté
- Rituels calendariés (non négociables)
- Checklists pour chaque revue
- Friction minimale (shortcuts, templates)

### 3. Mesurer pour Améliorer
- Track temps passé en revues
- Track nombre de WIGs atteints
- Track sentiment de contrôle (échelle 1-10)

### 4. Pardonner les Échecs
- Semaine ratée ? Reprendre immédiatement
- Pas de spirale de culpabilité
- Le système pardonne, vous aussi

---

## 📚 Ressources et Templates

### Checklists
- ☐ Checklist routine matinale (Google Doc)
- ☐ Checklist revue quotidienne (Google Doc)
- ☐ Checklist revue hebdomadaire (Notion)
- ☐ Checklist revue mensuelle (Notion)

### Templates Notion
- 📄 Template page Client
- 📄 Template page Projet
- 📄 Template WIG + Lead Measures
- 📄 Template note de réunion

### Automations NEXUS (futures)
- `nexus priorities today` → Google Tasks (actuel)
- `nexus sync-calendar` → Extraire temps passé par projet
- `nexus weekly-report` → Générer rapport Lead Measures

---

## 🎯 Métriques de Succès du Système

### Métriques Leading (Processus)
- ✅ Taux de complétion des routines matinales
- ✅ Taux de complétion des revues hebdo
- ✅ Temps moyen de traitement de l'inbox
- ✅ Nombre de projets avec Next Action définie

### Métriques Lagging (Résultats)
- 🎯 Nombre de WIGs atteints par trimestre
- 🎯 Nombre de projets complétés par mois
- 🎯 Sentiment de contrôle (survey mensuel)
- 🎯 Stress perçu (survey mensuel)

### Métriques d'Abandon (Signaux d'alerte)
- ⚠️ 2 semaines sans revue hebdo → Système en danger
- ⚠️ Notion non mis à jour 1+ mois → Simplifier
- ⚠️ Google Tasks > 50 items → Overload, clarifier

---

## 🔧 Troubleshooting Fréquent

### "Je n'ai pas le temps pour les revues"
**Solution :** Commencer plus petit
- Revue quotidienne : 5 min au lieu de 15
- Revue hebdo : 30 min au lieu de 60
- Mieux vaut 80% fait que 0%

### "Je ne sais pas où mettre certaines choses"
**Règle de décision :**
- Est-ce une action < 24h ? → Google Tasks
- Est-ce un projet multi-étapes ? → Notion Projets
- Est-ce une information sur un client ? → Notion Clients
- Est-ce une idée vague ? → Notion Someday/Maybe

### "Mon Notion devient trop complexe"
**Solution :** Audit trimestriel
- Archiver projets > 6 mois inactifs
- Supprimer vues non utilisées
- Fusionner DBs si possible
- Retour à la simplicité

### "Je ne tiens pas mes Lead Measures"
**Questions à se poser :**
- Sont-ils vraiment influençables ?
- Sont-ils trop ambitieux ?
- Les ai-je time-blockés dans Calendar ?
- Sont-ils alignés avec mes vraies priorités ?

---

## 🏁 Prochaines Étapes Recommandées

### Cette Semaine (Semaine 1)
1. ☐ Créer la structure Notion (2h)
2. ☐ Définir 1-2 WIGs pour Q1 2025 (30 min)
3. ☐ Identifier Lead Measures (30 min)
4. ☐ Bloquer les rituels dans Google Calendar (15 min)
5. ☐ Commencer routine matinale (tous les jours)

### Semaine 2
6. ☐ Ajouter revue quotidienne 16h
7. ☐ Migrer 5 premiers projets dans Notion

### Semaine 3
8. ☐ Première revue hebdomadaire (vendredi)
9. ☐ Ajustements basés sur learnings

### Semaine 4
10. ☐ Système fully operational
11. ☐ Célébrer la mise en place ! 🎉

---

## 💡 Conclusion

Ce système hybride combine :
- **La rigueur de GTD** (rien ne se perd, tout est capturé)
- **Le focus de 4DX** (1-2 WIGs, Lead Measures, accountability)
- **La simplicité de CORE** (capture instantanée, revues ritualisées)

**Forces de Google Workspace** : Vitesse, accessibilité, collaboration
**Forces de Notion** : Structure, vision, relations

**Vous restez au centre** : Décisions humaines, revues actives, ajustements continus

**Durabilité** : Commencer minimal, systèmes > volonté, kaizen

---

**"La complexité est l'ennemie de l'exécution. Restez simple, restez constant."**

— Christian Boulet, 2025
