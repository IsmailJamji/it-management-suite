# Rapport de projet — IT Management Suite (IT Suite)

**Version de l’application :** 1.0.1  
**Date du rapport :** 18 mai 2026  
**Type :** Application de bureau Windows  
**Organisation cible :** Service informatique / DSI (contexte DISTRA)

---

## 1. Synthèse exécutive

**IT Management Suite** (nom commercial **IT Suite**) est une application de bureau destinée à centraliser la gestion du parc informatique, des équipements télécom, des utilisateurs, des projets et des tâches au sein d’un service IT. Elle combine une interface moderne (React, TypeScript, Tailwind CSS), un socle desktop (Electron) et une persistance locale (SQLite via Better-SQLite3).

Le projet répond à une problématique récurrente en entreprise : la dispersion des données dans des fichiers Excel, l’absence de vision consolidée sur la santé du parc, et les difficultés de coordination entre plusieurs techniciens. La solution proposée fonctionne **hors ligne**, en **mode réseau partagé** (serveur/client) ou en **mode cloud** (synchronisation via OneDrive / Google Drive).

| Indicateur | Valeur |
|------------|--------|
| Version livrée | 1.0.1 |
| Plateforme cible | Windows 10/11 (64 bits) |
| Stack principale | Electron 22, React 18, TypeScript, SQLite |
| Modules métier | 9 pages fonctionnelles |
| Handlers IPC | ~77 points d’échange Electron |
| Langues UI | Français, anglais, espagnol |

---

## 2. Contexte et objectifs

### 2.1 Contexte

Les services informatiques gèrent un parc hétérogène : postes, serveurs, périphériques, lignes mobiles (opérateurs marocains IAM, INWI, Orange) et projets d’infrastructure. Sans outil dédié, la traçabilité des affectations, le suivi des garanties et la coordination des tâches deviennent difficiles.

### 2.2 Objectifs du projet

| Objectif | Statut | Réalisation |
|----------|--------|-------------|
| Centraliser les données IT | Atteint | Base SQLite unique, modules IT / télécom / appareils |
| Vision globale de l’activité | Atteint | Tableau de bord avec KPIs et graphiques de performance live |
| Travail en équipe | Atteint | Modes serveur, client, cloud (OneDrive) |
| Échanges de données | Atteint | Import / export Excel, CSV, JSON |
| Sécurisation des accès | Atteint | bcrypt + JWT, rôles admin / utilisateur |
| Ergonomie moderne | Atteint | Thème CloudCash, clair/sombre, multilingue |
| Déploiement Windows | Atteint | Installateur NSIS + version portable |

### 2.3 Problématique

> Comment concevoir une application de bureau unifiée, utilisable hors ligne et en équipe, pour inventorier les actifs IT et télécom, piloter projets et tâches, et offrir une vision synthétique du service informatique ?

---

## 3. Architecture technique

### 3.1 Vue d’ensemble

```
┌──────────────────────────────────────────────────────────────────┐
│                     IT Suite (Electron)                          │
├──────────────────────────────────────────────────────────────────┤
│  UI — React 18 + TypeScript + Tailwind CSS + Recharts            │
│  Pages : Dashboard, Devices, IT/Telecom Assets, Tasks, Projects, │
│          Users, Settings, System Info, Login                     │
├──────────────────────────────────────────────────────────────────┤
│  Preload (bridge sécurisé) — exposition API via window.electronAPI│
├──────────────────────────────────────────────────────────────────┤
│  Processus principal — IPC (~77 handlers), menu natif            │
│  Services : auth, assets, export/import, monitoring, IA, config  │
├──────────────────────────────────────────────────────────────────┤
│  Persistance — SQLite (Better-SQLite3) — it_management.db        │
│  Modes : Local | Serveur (UNC) | Client | Cloud (OneDrive/GDrive)│
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Stack technologique

| Couche | Technologies |
|--------|--------------|
| Interface | React 18, TypeScript, Tailwind CSS, React Router, Recharts, Lucide |
| Desktop | Electron 22, electron-builder, electron-updater |
| Données | SQLite, Better-SQLite3, schéma SQL versionné |
| Sécurité | bcryptjs, jsonwebtoken |
| Fichiers | ExcelJS, xlsx |
| Monitoring | systeminformation |
| IA (optionnel) | OpenAI API + repli local |
| i18n | Contexte React (FR / EN / ES) |
| Build | react-scripts, TypeScript (electron/), Python (icônes) |

### 3.3 Organisation du dépôt

| Répertoire | Rôle |
|------------|------|
| `src/` | Interface React (pages, composants, contextes) |
| `electron/` | Processus principal, preload, services, base de données |
| `electron/database/` | `schema.sql`, initialisation SQLite |
| `electron/services/` | Logique métier (12 services) |
| `assets/` | Icônes et branding |
| `scripts/` | `afterPack.cjs`, génération d’icônes |
| `release/` | Artefacts de build (installateur, portable) |
| `docs/` | Documentation utilisateur et technique |

---

## 4. Fonctionnalités réalisées

### 4.1 Modules utilisateur

| Module | Route | Description |
|--------|-------|-------------|
| Connexion | — | Authentification e-mail / mot de passe, modes d’installation |
| Tableau de bord | `/` | KPIs (appareils, tâches, projets, utilisateurs), graphiques performance **en temps réel**, santé système calculée |
| Appareils | `/devices` | Inventaire technique (OS, RAM, disque, IP, MAC, garantie…) |
| Actifs IT | `/it-assets` | Registre patrimonial (propriétaire, département, zone, série) |
| Actifs télécom | `/telecom-assets` | SIM / lignes IAM, INWI, Orange |
| Tâches | `/tasks` | Suivi opérationnel, affectation, avancement % |
| Projets | `/projects` | Pilotage (statuts, priorités, budget, responsable) |
| Utilisateurs | `/users` | Administration des comptes (admin) |
| Paramètres | `/settings` | Configuration base, thème, langue, OneDrive |
| Système | `/system` | Informations matérielles de la machine hôte |

### 4.2 Authentification et sécurité

- Hash des mots de passe (bcrypt), sessions JWT.
- Rôles **admin** et **user** ; table `permissions` pour affinage futur.
- Journal d’audit (`audit_logs`) : connexions et actions sensibles.
- Isolation Node via preload Electron (pas d’accès direct au FS depuis le renderer).

### 4.3 Modes de déploiement

| Mode | Emplacement base | Usage |
|------|-------------------|--------|
| **Local** | `%AppData%` utilisateur | Poste autonome |
| **Serveur** | `Documents\IT-Management-Data\it_management.db` + partage réseau | Poste central |
| **Client** | Chemin UNC `\\serveur\IT-Management-Data\...` | Postes distants |
| **Cloud** | `OneDrive*\IT-Management-Cloud\it_management.db` | Sync multi-PC via OneDrive ou Google Drive |

L’assistant d’installation guide le choix au premier lancement. La page **Paramètres → Database** permet de changer de chemin, tester la connexion et configurer OneDrive.

### 4.4 Import / export et IA

- Export Excel formaté, CSV, JSON ; import Excel avec mapping intelligent des colonnes (FR/EN).
- Service agent IA (recommandations, analyse de santé du parc) avec repli local si clé OpenAI absente.
- Logs des interactions IA dans `ai_agent_logs`.

### 4.5 Monitoring et tableau de bord

- Métriques live CPU / mémoire / disque via `systeminformation`.
- Composant `SystemPerformanceChart` (graphiques interactifs Recharts).
- Historisation possible dans `system_monitoring` par appareil.

---

## 5. Modèle de données

Fichier principal : `electron/database/schema.sql`  
Nom de fichier en production : **`it_management.db`**

| Table | Description |
|-------|-------------|
| `users` | Comptes, rôles, départements |
| `devices` | Parc technique détaillé |
| `device_types` | Référentiel (laptop, desktop, serveur…) |
| `it_assets` | Registre patrimonial informatique |
| `telecom_assets` | Lignes SIM (IAM, INWI, ORANGE) |
| `projects` | Projets IT |
| `tasks` | Tâches et suivi |
| `task_comments` | Commentaires sur tâches |
| `system_monitoring` | Historique métriques |
| `permissions` | Droits granulaires |
| `audit_logs` | Traçabilité |
| `ai_agent_logs` | Historique agent IA |

Index créés sur les colonnes fréquemment filtrées (statut, utilisateur assigné, dates).

---

## 6. Évolutions récentes (cycle de maintenance)

Les travaux suivants ont été réalisés sur la version **1.0.1** :

| Domaine | Amélioration |
|---------|--------------|
| **OneDrive** | Détection automatique de `OneDrive - DISTRA` (variables d’env. + scan du profil) ; création du dossier `IT-Management-Cloud` **et** initialisation SQLite |
| **Paramètres DB** | Chargement asynchrone avec timeout réseau (évite freeze UI) |
| **Dashboard** | Graphiques de performance réels (plus de données statiques) |
| **Branding** | IT Suite, icônes multi-tailles, thème CloudCash (`#4318FF`, `#05CD99`) |
| **Packaging** | Copie forcée `ffmpeg.dll` et DLL Chromium (`afterPack.cjs`, `extraFiles`) |
| **Build** | Installeur NSIS + portable générés dans `release/` |

Chemin cloud typique sur le poste de développement :

`C:\Users\<utilisateur>\OneDrive - DISTRA\IT-Management-Cloud\it_management.db`

---

## 7. Build, livrables et déploiement

### 7.1 Commandes de build

```powershell
npm install
npm run dev              # Développement
npm run build:installer  # Production + installeur Windows
```

### 7.2 Artefacts générés

| Fichier | Description |
|---------|-------------|
| `release\IT Suite Setup 1.0.1.exe` | Installateur Windows (NSIS, ~77 Mo) |
| `release\IT-Suite-Portable.exe` | Version portable sans installation |
| `release\win-unpacked\` | Application décompressée (tests) |

### 7.3 Prérequis système

| Ressource | Minimum | Recommandé |
|-----------|---------|------------|
| OS | Windows 10/11 64 bits | Windows 11 |
| RAM | 4 Go | 8 Go |
| Disque | ~500 Mo libres | 1 Go |
| Réseau | Optionnel (modes serveur/client/cloud) | LAN stable pour partage |

### 7.4 Compte par défaut

- **E-mail :** `admin@itmanagement.com`  
- **Mot de passe :** `admin123`  
- À modifier en production.

---

## 8. Documentation fournie

| Document | Contenu |
|----------|---------|
| `docs/CAHIER_DES_CHARGES.md` | Dossier de soutenance académique |
| `docs/QUICK_START_GUIDE.md` | Démarrage en 5 minutes |
| `docs/INSTALLATION_GUIDE.md` | Installation détaillée |
| `docs/NETWORK_SETUP_GUIDE.md` | Configuration multi-utilisateurs |
| `docs/USER_MANUAL.md` | Manuel utilisateur complet |
| `docs/TROUBLESHOOTING_FAQ.md` | Dépannage et FAQ |
| `docs/RAPPORT_PROJET.md` | Ce rapport |

---

## 9. Points forts et limites

### 9.1 Points forts

- Solution **tout-en-un** pour un service IT (parc, télécom, projets, tâches).
- Fonctionnement **hors ligne** et déploiement **flexible** (local, réseau, cloud).
- Interface **moderne**, multilingue, avec thème clair/sombre.
- Code structuré en **services TypeScript** côté Electron.
- **Traçabilité** via logs d’audit et export Excel pour reporting.

### 9.2 Limites connues

| Limite | Détail |
|--------|--------|
| Plateforme | Build et tests principalement sur **Windows** |
| SQLite partagé | Accès concurrent multi-écriture limité (risque de verrouillage en forte charge) |
| Cloud | Sync OneDrive = copie de fichier, pas de résolution de conflits temps réel |
| IA | Nécessite une clé API OpenAI pour le mode complet |
| Tests automatisés | Peu ou pas de suite de tests unitaires / E2E documentée |

---

## 10. Recommandations

1. **Production :** changer le mot de passe admin par défaut et configurer une clé OpenAI si l’agent IA est utilisé.
2. **Multi-postes :** privilégier le mode **serveur/client** pour usage intensif ; OneDrive pour 2–3 postes avec faible écriture simultanée.
3. **Sauvegarde :** planifier des copies régulières de `it_management.db` (local ou dossier cloud).
4. **Évolutions possibles :** API REST centralisée, PostgreSQL pour forte concurrence, tests automatisés, signatures de code pour l’installateur.

---

## 11. Conclusion

Le projet **IT Management Suite / IT Suite** constitue une application de bureau complète et opérationnelle pour la gestion quotidienne d’un service informatique. L’architecture Electron / React / SQLite offre un bon compromis entre richesse d’interface, autonomie hors ligne et collaboration via réseau ou cloud.

La version **1.0.1** intègre les correctifs critiques (OneDrive entreprise, packaging Windows, monitoring live) et est livrable sous forme d’installateur et de version portable prêts à déployer.

---

*Rapport établi pour le projet IT Management Suite — DISTRA / usage académique et professionnel.*
