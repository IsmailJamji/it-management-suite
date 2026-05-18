# IT Management Suite — Dossier de soutenance académique

**Type de document :** Présentation du travail réalisé  
**Projet :** Application de gestion du parc informatique et des opérations IT  
**Plateforme :** Application de bureau Windows

---

## Résumé

Ce document présente **IT Management Suite**, une application de bureau développée pour centraliser la gestion du parc informatique, des équipements télécom, des utilisateurs, des projets et des tâches au sein d’un service informatique. Le travail réalisé combine une interface moderne (React, TypeScript), un socle desktop (Electron) et une persistance locale (SQLite), avec des modes de déploiement adaptés à un usage individuel ou collaboratif en réseau.

---

## 1. Problématique et motivation

### 1.1 Contexte

Les services informatiques doivent suivre un parc hétérogène : postes de travail, serveurs, périphériques, lignes mobiles et projets d’infrastructure. L’usage de fichiers Excel dispersés ou d’outils non adaptés entraîne :

- une perte de traçabilité sur les affectations et le cycle de vie du matériel ;
- une difficulté à consolider les indicateurs de santé des machines ;
- une coordination limitée entre plusieurs techniciens.

### 1.2 Problématique

Comment concevoir et réaliser une **application de bureau unifiée**, utilisable hors ligne et en équipe, permettant d’inventorier les actifs IT et télécom, de piloter les projets et tâches, et d’offrir une vision synthétique de l’activité du service informatique ?

### 1.3 Objectifs atteints

| Objectif | Réalisation |
|----------|-------------|
| Centraliser les données IT | Modules actifs IT, télécom, appareils et utilisateurs dans une même base |
| Offrir une vision globale | Tableau de bord avec graphiques de performance |
| Supporter le travail en équipe | Modes serveur et client avec base partagée sur le réseau |
| Faciliter les échanges de données | Import et export Excel, CSV et JSON |
| Sécuriser l’accès | Authentification par jeton JWT et mots de passe chiffrés |
| Adapter l’interface | Thème clair/sombre et interface en français, anglais et espagnol |

---

## 2. Analyse des besoins

### 2.1 Besoins fonctionnels couverts

L’application répond aux besoins suivants, **tous implémentés** dans la version livrée :

1. **Authentification** des utilisateurs et gestion des sessions.
2. **Gestion du parc informatique** (postes, serveurs, périphériques).
3. **Gestion des actifs IT** avec registre patrimonial détaillé.
4. **Gestion des actifs télécom** (opérateurs IAM, INWI, Orange).
5. **Suivi des projets** et des **tâches** associées.
6. **Administration des comptes** utilisateurs.
7. **Tableau de bord** et **monitoring** de la machine hôte.
8. **Import / export** des données pour migration et reporting.
9. **Déploiement flexible** : poste autonome ou architecture serveur/client.

### 2.2 Acteurs du système

| Acteur | Usage réalisé dans l’application |
|--------|----------------------------------|
| Administrateur | Gestion des utilisateurs, configuration, exports |
| Technicien IT | Saisie des actifs, suivi des appareils et des tâches |
| Responsable de projet | Création de projets et affectation des tâches |
| Utilisateur standard | Consultation et mise à jour selon son rôle |

### 2.3 Profils d’accès réalisés

Deux profils sont opérationnels dans l’application :

| Profil | Capacités réalisées |
|--------|---------------------|
| **Administrateur** | Gestion complète des utilisateurs, des données et des paramètres |
| **Utilisateur** | Accès aux modules métier selon les droits du compte |

La base de données prévoit également une table de **permissions** pour affiner les droits par ressource.

---

## 3. Conception et architecture

### 3.1 Architecture générale

L’application suit une architecture en couches :

```
┌─────────────────────────────────────────────────────────────┐
│                    IT Management Suite                       │
├─────────────────────────────────────────────────────────────┤
│  Interface utilisateur (React, TypeScript, Tailwind CSS)    │
│  Pages : Tableau de bord, Appareils, Actifs IT/Télécom,     │
│          Projets, Tâches, Utilisateurs, Paramètres, Système │
├─────────────────────────────────────────────────────────────┤
│  Couche Electron (processus principal, preload, IPC)        │
│  Services : authentification, actifs, export, monitoring    │
├─────────────────────────────────────────────────────────────┤
│  Persistance SQLite (Better-SQLite3)                         │
│  Modes : Local | Serveur (partage réseau) | Client          │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Technologies utilisées

| Couche | Technologies |
|--------|--------------|
| Interface | React, TypeScript, Tailwind CSS, React Router |
| Application desktop | Electron |
| Données | SQLite, Better-SQLite3 |
| Sécurité | bcryptjs, JSON Web Token |
| Graphiques | Recharts |
| Fichiers | ExcelJS, bibliothèque xlsx |
| Monitoring matériel | SystemInformation |
| Assistant intelligent | API OpenAI (avec repli local si clé non configurée) |
| Internationalisation | Contexte multilingue (français, anglais, espagnol) |

### 3.3 Organisation du code source

| Module | Rôle |
|--------|------|
| `src/` | Pages et composants React, contextes (authentification, thème, langue, notifications) |
| `electron/` | Processus principal, services métier, accès base de données |
| `electron/database/` | Schéma SQL et initialisation de la base |
| `docs/` | Guides d’installation, réseau et manuel utilisateur |

---

## 4. Réalisations fonctionnelles

Cette section décrit **uniquement ce qui a été développé et intégré** dans l’application.

### 4.1 Authentification et sécurité des accès

- Écran de connexion par adresse e-mail et mot de passe.
- Stockage des mots de passe sous forme de hash (bcrypt).
- Génération de jetons JWT pour la session utilisateur.
- Blocage des comptes désactivés.
- Journalisation des connexions dans les logs d’audit.
- Déconnexion depuis l’interface.

### 4.2 Assistant d’installation et modes de déploiement

- Assistant graphique au premier lancement.
- **Mode Local** : base de données sur le poste de travail.
- **Mode Serveur** : création d’un dossier partagé réseau pour la base commune.
- **Mode Client** : connexion au serveur via chemin réseau UNC.
- Découverte des serveurs disponibles sur le réseau en mode client.
- Test de connectivité avant validation de la configuration client.
- Repli sur une base locale si le serveur est temporairement inaccessible.

### 4.3 Gestion des appareils

- Création, consultation, modification et suppression des appareils.
- Types prédéfinis : portable, bureau, imprimante, téléphone, tablette, serveur, équipement réseau, écran, etc.
- Informations techniques : système d’exploitation, processeur, mémoire, disque, adresses IP et MAC.
- Affectation à un utilisateur, localisation, dates d’achat et de garantie.
- Statuts : actif, inactif, en maintenance, retiré.

### 4.4 Actifs informatiques (IT)

- Registre des équipements par propriétaire, département et zone.
- Numéro de série unique par actif.
- Champs dédiés aux postes (RAM, disque, processeur, OS) et aux périphériques.
- Recherche, filtrage et suppression multiple.
- Import de fichiers Excel avec reconnaissance automatique des colonnes (français et anglais).

### 4.5 Actifs télécom

- Gestion des lignes et cartes SIM pour les opérateurs **IAM**, **INWI** et **ORANGE**.
- Suivi du propriétaire, du type d’abonnement, de la zone et du département.
- Champs complémentaires : numéro de téléphone, forfait data, codes PIN/PUK.
- Représentation visuelle par opérateur (icônes dédiées).
- Statuts : actif, inactif, suspendu.
- Import et export Excel.

### 4.6 Projets et tâches

- Gestion complète des projets (nom, description, statut, priorité, dates, budget, responsable).
- Statuts de projet : planification, actif, en pause, terminé, annulé.
- Gestion des tâches rattachées à un projet.
- Affectation à un utilisateur (identifiant ou e-mail).
- Suivi de l’avancement en pourcentage et des heures estimées/réelles.
- Statuts de tâche : à faire, en cours, en revue, terminé, annulé.
- Structure de base pour les commentaires sur les tâches.

### 4.7 Gestion des utilisateurs

- Création et modification des comptes (identifiant, e-mail, nom, prénom, département).
- Attribution du rôle administrateur ou utilisateur.
- Activation et désactivation des comptes.

### 4.8 Tableau de bord et monitoring

- Vue synthétique des indicateurs clés (actifs, tâches, projets).
- Graphiques interactifs (utilisation processeur, mémoire, disque).
- Page d’informations système de la machine hôte (processeur, mémoire, disques, réseau).
- Historisation des métriques de monitoring par appareil en base de données.
- Service de monitoring exécutable en arrière-plan.

### 4.9 Import et export

- Export Excel avec mise en forme (titres, couleurs, statistiques).
- Export CSV et JSON.
- Import Excel avec mapping intelligent des en-têtes.
- Libellés d’export adaptés à la langue de l’interface.

### 4.10 Interface et ergonomie

- Navigation latérale entre tous les modules.
- En-tête avec notifications et accès au profil.
- Thème clair et thème sombre.
- Sélecteur de langue : français, anglais, espagnol.
- Messages de retour utilisateur (chargement, succès, erreurs).
- Formulaires validés.
- Notification de mise à jour de l’application.
- Menu natif Electron (création de projet, tâche, export, informations système).

### 4.11 Services d’intelligence artificielle (backend)

- Service d’agent IA intégré côté serveur Electron.
- Recommandations contextuelles sur les tâches, appareils et projets.
- Analyse de santé du parc avec score et pistes d’amélioration.
- Mode de repli avec suggestions locales lorsque l’API OpenAI n’est pas configurée.
- Journalisation des interactions dans la table dédiée.

### 4.12 Collaboration multi-utilisateurs

- Partage de la base SQLite via un dossier réseau en mode serveur.
- Accès simultané de plusieurs postes clients à la même base.
- Fonctionnement autonome hors ligne en mode local.

---

## 5. Modèle de données réalisé

### 5.1 Entités implémentées

| Table | Description |
|-------|-------------|
| `users` | Comptes et rôles |
| `devices` | Inventaire technique des appareils |
| `device_types` | Référentiel des types d’appareils |
| `it_assets` | Registre patrimonial informatique |
| `telecom_assets` | Lignes et SIM (IAM, INWI, Orange) |
| `projects` | Projets IT |
| `tasks` | Tâches et suivi d’avancement |
| `task_comments` | Commentaires liés aux tâches |
| `system_monitoring` | Historique des métriques |
| `permissions` | Droits par utilisateur et ressource |
| `audit_logs` | Traçabilité des actions |
| `ai_agent_logs` | Historique des actions de l’agent IA |

### 5.2 Relations principales

- Un appareil peut être affecté à un utilisateur.
- Une tâche est rattachée à un projet et peut être assignée à un utilisateur.
- Un projet est associé à un responsable.
- Les mesures de monitoring sont liées à un appareil.

---

## 6. Écrans développés

| Module | Fonction |
|--------|----------|
| Connexion | Authentification sécurisée |
| Tableau de bord | Synthèse et graphiques |
| Appareils | Inventaire réseau et technique |
| Actifs IT | Parc informatique et périphériques |
| Actifs télécom | Parc mobile et SIM |
| Tâches | Suivi opérationnel |
| Projets | Pilotage des chantiers IT |
| Utilisateurs | Administration des comptes |
| Paramètres | Configuration de l’application |
| Système | Informations matérielles de la machine |

---

## 7. Qualité, sécurité et contraintes techniques

### 7.1 Mesures de sécurité réalisées

- Mots de passe jamais stockés en clair.
- Authentification par jeton JWT.
- Isolation du code Node.js via le script preload Electron.
- Journal d’audit des actions sensibles (connexions, modifications).
- Désactivation de compte sans suppression immédiate des données.

### 7.2 Qualités non fonctionnelles

| Aspect | Réalisation |
|--------|-------------|
| **Performance** | Requêtes SQLite indexées ; interface réactive |
| **Fiabilité** | Transactions SQLite ; gestion d’erreur réseau en mode client |
| **Compatibilité** | Windows 10/11 (64 bits), résolution minimale 1280×720 |
| **Maintenabilité** | Code TypeScript structuré par services |
| **Utilisabilité** | Interface responsive, assistant d’installation, multilingue |
| **Déployabilité** | Installateur Windows et version portable |

### 7.3 Environnement d’exécution

| Ressource | Configuration supportée |
|-----------|-------------------------|
| Système | Windows 10/11 (64 bits) |
| Mémoire | 4 Go minimum (8 Go recommandé) |
| Stockage | Environ 500 Mo d’espace libre |
| Réseau | Requis pour les modes serveur et client |

---

## 8. Livrables du projet

| Livrable | Description |
|----------|-------------|
| Application desktop | Exécutable Windows (installateur et version portable) |
| Code source | Projet complet React + Electron + TypeScript |
| Base de données | Schéma SQL et fichier SQLite |
| Documentation | Guides d’installation, configuration réseau, manuel utilisateur et FAQ |
| Dossier de soutenance | Ce document |

---

## 9. Démonstration — scénario de soutenance

Pour la présentation orale, le parcours suivant illustre les réalisations :

1. **Lancement** de l’application et passage par l’assistant d’installation (mode local ou client).
2. **Connexion** avec un compte administrateur.
3. **Tableau de bord** : consultation des indicateurs et graphiques.
4. **Actifs IT** : ajout d’un équipement et import Excel.
5. **Actifs télécom** : enregistrement d’une ligne avec choix de l’opérateur.
6. **Projet et tâche** : création, affectation et mise à jour de l’avancement.
7. **Export** des données en Excel.
8. **Page Système** : affichage des caractéristiques matérielles du poste.
9. **Paramètres** : changement de thème et de langue.

---

## 10. Conclusion

Le projet **IT Management Suite** a permis de concevoir et de développer une application de bureau complète pour la gestion opérationnelle d’un service informatique. Les modules livrés couvrent l’inventaire des actifs IT et télécom, le pilotage des projets et des tâches, l’administration des utilisateurs, le monitoring et les échanges de données par fichiers.

L’architecture Electron / React / SQLite offre un bon compromis entre richesse de l’interface, autonomie hors ligne et travail collaboratif en réseau. Les choix techniques (TypeScript, services modulaires, journal d’audit) favorisent la maintenabilité et la crédibilité du prototype dans un contexte professionnel ou académique.

---

## Annexes

### A. Glossaire

| Terme | Définition |
|-------|------------|
| **DSI** | Direction des systèmes d’information |
| **JWT** | JSON Web Token — jeton d’authentification |
| **IPC** | Communication inter-processus (Electron) |
| **UNC** | Chemin réseau Windows (`\\serveur\partage`) |
| **SQLite** | Moteur de base de données embarqué |

### B. Opérateurs télécom pris en charge

| Code | Opérateur |
|------|-----------|
| IAM | Maroc Telecom |
| INWI | INWI |
| ORANGE | Orange Maroc |

### C. Documentation technique fournie

- Guide d’installation
- Guide de démarrage rapide
- Guide de configuration réseau
- Manuel utilisateur
- Foire aux questions et dépannage

---

*Document établi pour la soutenance académique du projet IT Management Suite — présentation du travail réalisé.*
