# Diagrammes UML — IT Management Suite (IT Suite)

**Version :** 1.0.1  
**Notation :** Mermaid (visualisable dans Cursor, VS Code, GitHub, ou [mermaid.live](https://mermaid.live))

> Copiez chaque bloc `mermaid` dans un éditeur Mermaid pour exporter en PNG/SVG/PDF.

---

## 1. Architecture logicielle (vue en couches)

```mermaid
flowchart TB
    subgraph Presentation["Couche présentation (Renderer)"]
        Pages["Pages React<br/>Dashboard, Devices, IT/Télécom,<br/>Tasks, Projects, Users, Settings"]
        Ctx["Contextes<br/>Auth, Theme, Language, Notifications"]
        UI["Composants UI<br/>Charts, Modals, Sidebar, Brand"]
    end

    subgraph Bridge["Couche pont"]
        Preload["preload.ts<br/>window.electronAPI"]
    end

    subgraph Application["Couche application (Main Process)"]
        Main["main.ts<br/>IPC Handlers (~77)"]
        subgraph Services["Services métier"]
            AuthS["AuthService"]
            ITS["ITAssetsService"]
            TelS["TelecomAssetsService"]
            ExpS["ExcelExport/ImportService"]
            MonS["SystemMonitoringService"]
            AIS["AIAgent"]
            DCS["DatabaseConfigService"]
        end
    end

    subgraph Data["Couche données"]
        DB["Database<br/>Better-SQLite3"]
        SQL["schema.sql"]
        File["it_management.db"]
    end

    subgraph External["Externe"]
        OS["OS Windows<br/>systeminformation"]
        Cloud["OneDrive / Google Drive"]
        Net["Partage réseau UNC"]
        OAI["API OpenAI (optionnel)"]
    end

    Pages --> Ctx
    Pages --> UI
    Pages <-->|IPC invoke| Preload
    Preload <-->|ipcMain/ipcRenderer| Main
    Main --> Services
    AuthS & ITS & TelS & MonS & AIS --> DB
    DCS --> File
    DB --> SQL
    DB --> File
    File -.-> Cloud
    File -.-> Net
    MonS --> OS
    AIS -.-> OAI
```

---

## 2. Architecture composants (Electron)

```mermaid
flowchart LR
    subgraph Poste["Poste utilisateur Windows"]
        subgraph ElectronApp["Application Electron IT Suite"]
            R["Processus Renderer<br/>React SPA"]
            P["Processus Preload<br/>Context Bridge"]
            M["Processus Main<br/>Node.js + Services"]
        end
    end

    R <-->|contextBridge| P
    P <-->|IPC| M
    M --> SQLite[(SQLite<br/>it_management.db)]

    SQLite --> Local["%AppData%<br/>Mode local"]
    SQLite --> Share["\\\\Serveur\\IT-Management-Data<br/>Mode serveur/client"]
    SQLite --> OD["OneDrive - DISTRA\\<br/>IT-Management-Cloud<br/>Mode cloud"]
```

---

## 3. Diagramme de classes — domaine métier (entités)

Modèle dérivé de `electron/database/schema.sql`.

```mermaid
classDiagram
    direction TB

    class User {
        +int id
        +string username
        +string email
        +string password_hash
        +enum role
        +string first_name
        +string last_name
        +string department
        +bool is_active
        +datetime created_at
    }

    class DeviceType {
        +int id
        +string name
        +string description
    }

    class Device {
        +int id
        +string name
        +int device_type_id
        +string serial_number
        +string hostname
        +enum status
        +int assigned_user_id
        +string os_name
        +int ram_gb
        +datetime last_seen
    }

    class ITAsset {
        +int id
        +string device_type
        +string owner_name
        +string department
        +string zone
        +string serial_number
        +string brand
        +enum status
    }

    class TelecomAsset {
        +int id
        +enum provider
        +string sim_number
        +string sim_owner
        +string subscription_type
        +enum status
    }

    class Project {
        +int id
        +string name
        +enum status
        +enum priority
        +int manager_id
        +decimal budget
    }

    class Task {
        +int id
        +string title
        +enum status
        +enum priority
        +int project_id
        +int assigned_user_id
        +int progress_percentage
    }

    class TaskComment {
        +int id
        +int task_id
        +int user_id
        +string comment
    }

    class SystemMonitoring {
        +int id
        +int device_id
        +decimal cpu_usage
        +decimal memory_usage
        +decimal disk_usage
        +datetime recorded_at
    }

    class Permission {
        +int id
        +int user_id
        +string permission_type
        +bool granted
    }

    class AuditLog {
        +int id
        +int user_id
        +string action
        +string resource_type
        +datetime created_at
    }

    class AIAgentLog {
        +int id
        +string action_type
        +int user_id
        +string ai_response
    }

    User "1" --> "0..*" Device : assigné à
    DeviceType "1" --> "0..*" Device : type
    User "1" --> "0..*" Project : manage
    Project "1" --> "0..*" Task : contient
    User "1" --> "0..*" Task : assigné
    Task "1" --> "0..*" TaskComment : commentaires
    Device "1" --> "0..*" SystemMonitoring : métriques
    User "1" --> "0..*" Permission : droits
    User "1" --> "0..*" AuditLog : actions
    User "1" --> "0..*" AIAgentLog : interactions IA
```

---

## 4. Diagramme de classes — services applicatifs

```mermaid
classDiagram
    direction TB

    class Database {
        -db: BetterSqlite3
        -configService: DatabaseConfigService
        +setDatabasePath(path)
        +initializeDatabase()
        +isDatabaseInitialized(path)
        +getUserByEmail(email)
        +getAllDevices()
        +getAllTasks()
    }

    class DatabaseConfigService {
        -config: DatabaseConfig
        +setMode(mode, serverInfo)
        +resolveOneDriveRoot()
        +createSyncFolder(type)
        +applyDatabasePathConfig(path, mode)
        +testDatabaseConnection(path)
    }

    class AuthService {
        -currentUser: User
        +login(email, password) LoginResult
        +logout()
        +verifyToken(token)
        +register(userData)
    }

    class ITAssetsService {
        +getAll()
        +create(asset)
        +update(id, asset)
        +delete(id)
    }

    class TelecomAssetsService {
        +getAll()
        +create(asset)
        +update(id, asset)
        +delete(id)
    }

    class ExcelExportService {
        +exportToExcel(data, type)
        +exportToCSV()
        +exportToJSON()
    }

    class ExcelImportService {
        +importFromExcel(filePath)
        +mapColumns(headers)
    }

    class SystemInfoCollector {
        +getLiveMetrics()
        +getSystemInfo()
    }

    class SystemMonitoringService {
        +recordMetrics(deviceId)
        +getHistory(deviceId)
    }

    class AIAgent {
        +getRecommendations(context)
        +analyzeFleetHealth()
    }

    class MainProcess {
        +registerIpcHandlers()
    }

  MainProcess --> Database : utilise
  MainProcess --> AuthService
  MainProcess --> ITAssetsService
  MainProcess --> TelecomAssetsService
  MainProcess --> ExcelExportService
  MainProcess --> ExcelImportService
  MainProcess --> SystemInfoCollector
  MainProcess --> AIAgent
  Database --> DatabaseConfigService : composition
  AuthService --> Database : accès données
  ITAssetsService --> Database
  TelecomAssetsService --> Database
```

---

## 5. Diagramme de cas d’utilisation

```mermaid
flowchart TB
    subgraph Acteurs
        Admin((Administrateur))
        Tech((Technicien IT))
        PM((Responsable projet))
        User((Utilisateur))
        Sys((Système / Electron))
    end

    subgraph Auth["Authentification"]
        UC1[Se connecter]
        UC2[Gérer les comptes utilisateurs]
    end

    subgraph Install["Installation"]
        UC3[Configurer mode Local / Serveur / Client / Cloud]
        UC4[Configurer base OneDrive]
    end

    subgraph Assets["Actifs"]
        UC5[Gérer les appareils]
        UC6[Gérer les actifs IT]
        UC7[Gérer les actifs télécom]
        UC8[Importer / Exporter Excel]
    end

    subgraph Work["Travail"]
        UC9[Gérer les projets]
        UC10[Gérer les tâches]
    end

    subgraph Monitor["Suivi"]
        UC11[Consulter le tableau de bord]
        UC12[Monitorer performance système]
    end

    subgraph Other["Autres"]
        UC13[Changer thème et langue]
        UC14[Utiliser l'assistant IA]
    end

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Admin --> UC13

    Tech --> UC1
    Tech --> UC5
    Tech --> UC6
    Tech --> UC7
    Tech --> UC8
    Tech --> UC10
    Tech --> UC11
    Tech --> UC12

    PM --> UC1
    PM --> UC9
    PM --> UC10
    PM --> UC11

    User --> UC1
    User --> UC10
    User --> UC11

    Sys --> UC12
    Sys --> UC4

    UC3 -.->|include| UC4
    UC11 -.->|include| UC12
```

### Tableau des cas d’utilisation

| ID | Cas d’utilisation | Acteur principal | Priorité |
|----|-------------------|------------------|----------|
| UC1 | Se connecter | Tous | Haute |
| UC2 | Gérer les comptes | Admin | Haute |
| UC3 | Configurer le déploiement | Admin | Haute |
| UC4 | Sync OneDrive | Admin | Moyenne |
| UC5 | Gérer appareils | Admin, Technicien | Haute |
| UC6 | Gérer actifs IT | Admin, Technicien | Haute |
| UC7 | Gérer actifs télécom | Admin, Technicien | Haute |
| UC8 | Import/Export | Admin, Technicien | Moyenne |
| UC9 | Gérer projets | Admin, Chef projet | Haute |
| UC10 | Gérer tâches | Tous (selon droits) | Haute |
| UC11 | Tableau de bord | Tous | Haute |
| UC12 | Monitoring | Technicien, Système | Moyenne |
| UC13 | Paramètres UI | Admin | Basse |
| UC14 | Assistant IA | Admin | Basse |

---

## 6. Diagrammes de séquence

### 6.1 Authentification (connexion)

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant LP as LoginPage (React)
    participant API as electronAPI.preload
    participant M as main.ts (IPC)
    participant AS as AuthService
    participant DB as Database (SQLite)

    U->>LP: Saisit email + mot de passe
    LP->>API: auth.login(email, password)
    API->>M: ipc invoke auth-login
    M->>AS: login(email, password)
    AS->>DB: getUserByEmail(email)
    DB-->>AS: user + password_hash
    AS->>AS: bcrypt.compare(password, hash)
    alt Mot de passe valide
        AS->>AS: jwt.sign(payload)
        AS->>DB: logAudit(login)
        AS-->>M: { success, user, token }
        M-->>API: LoginResult
        API-->>LP: utilisateur connecté
        LP-->>U: Redirection Dashboard
    else Échec
        AS-->>M: { success: false }
        M-->>LP: message erreur
        LP-->>U: Notification erreur
    end
```

### 6.2 Création d’un actif IT (CRUD via IPC)

```mermaid
sequenceDiagram
    autonumber
    actor U as Technicien
    participant P as ITAssetsPage
    participant API as electronAPI
    participant M as main.ts
    participant S as ITAssetsService
    participant DB as Database

    U->>P: Remplit formulaire actif
    P->>API: itAssets.create(data)
    API->>M: ipc it-assets-create
    M->>S: create(asset)
    S->>DB: INSERT it_assets
    DB-->>S: id créé
    S-->>M: asset
    M-->>API: résultat
    API-->>P: succès
    P-->>U: Toast + rafraîchissement liste
```

### 6.3 Configuration base OneDrive

```mermaid
sequenceDiagram
    autonumber
    actor A as Administrateur
    participant SP as SettingsPage
    participant API as electronAPI
    participant M as main.ts
    participant DCS as DatabaseConfigService
    participant DB as Database

    A->>SP: Clic "Setup OneDrive"
    SP->>API: installation.createSyncFolder('onedrive')
    API->>M: ipc installation-create-sync-folder
    M->>DCS: createSyncFolder('onedrive')
    DCS->>DCS: resolveOneDriveRoot()
    DCS->>DCS: mkdir IT-Management-Cloud
    DCS-->>M: { success, dbPath, folderPath }
    M->>DCS: applyDatabasePathConfig(dbPath, 'cloud')
    M->>DB: setDatabasePath(dbPath)
    alt DB non initialisée
        M->>DB: initializeDatabase()
        DB->>DB: exécute schema.sql
    end
    M-->>API: { success, dbPath }
    API-->>SP: confirmation
    SP-->>A: Notification succès
```

### 6.4 Lecture métriques tableau de bord (temps réel)

```mermaid
sequenceDiagram
    autonumber
    participant D as Dashboard
    participant Chart as SystemPerformanceChart
    participant API as electronAPI
    participant M as main.ts
    participant SI as SystemInfoCollector

    loop Toutes les 2 secondes
        Chart->>API: system.getLiveMetrics()
        API->>M: ipc system-get-live-metrics
        M->>SI: getLiveMetrics()
        SI->>SI: systeminformation (CPU, RAM, disk)
        SI-->>M: metrics
        M-->>API: données
        API-->>Chart: points graphique
        Chart->>D: update systemHealth
    end
```

---

## 7. Diagramme de déploiement

```mermaid
flowchart TB
    subgraph Internet["Internet (optionnel)"]
        OpenAI["API OpenAI"]
    end

    subgraph CloudSync["Synchronisation cloud"]
        OD["OneDrive - DISTRA<br/>IT-Management-Cloud/<br/>it_management.db"]
        GD["Google Drive<br/>IT-Management-Cloud/"]
    end

    subgraph LAN["Réseau local (optionnel)"]
        ServerPC["PC Serveur<br/>Windows 10/11"]
        Share["Partage SMB<br/>\\\\Serveur\\IT-Management-Data"]
        ClientPC2["PC Client 2"]
    end

    subgraph UserPC["Poste utilisateur"]
        subgraph Runtime["Runtime Electron 22"]
            App["IT Suite.exe<br/>Renderer + Main + Preload"]
            Native["better-sqlite3.node"]
        end
        LocalDB["Base locale<br/>%AppData%/it_management.db"]
    end

    App --> Native
    Native --> LocalDB
    Native -.->|Mode cloud| OD
    Native -.->|Mode cloud| GD
    Native -.->|Mode client| Share
    ServerPC --> Share
    ClientPC2 -.->|Mode client| Share
    App -.->|IA optionnelle| OpenAI

    subgraph Artifacts["Artefacts de distribution"]
        NSIS["IT Suite Setup 1.0.1.exe"]
        Portable["IT-Suite-Portable.exe"]
    end

    NSIS -->|installe| App
    Portable -->|exécute| App
```

### Modes de déploiement

| Mode | Nœud physique | Fichier de données |
|------|---------------|------------------|
| Local | 1 PC | `%AppData%\...\it_management.db` |
| Serveur | PC serveur + partage SMB | `Documents\IT-Management-Data\` |
| Client | N PCs clients | UNC vers le serveur |
| Cloud | N PCs + OneDrive | `OneDrive*\IT-Management-Cloud\` |

---

## 8. Diagramme de Gantt (planning projet)

Planning type pour un projet académique / professionnel sur **~16 semaines**.

```mermaid
gantt
    title IT Management Suite — Planning projet
    dateFormat YYYY-MM-DD
    axisFormat %d/%m

    section Analyse
    Étude du besoin & cahier des charges     :a1, 2025-01-06, 14d
    Analyse concurrentielle & spécifications :a2, after a1, 7d

    section Conception
    Architecture & modèle de données         :c1, 2025-01-27, 14d
    Maquettes UI (CloudCash)                 :c2, after c1, 10d
    Diagrammes UML                           :c3, after c1, 7d

    section Développement
    Setup Electron + React + SQLite          :d1, 2025-02-24, 7d
    Module Auth & utilisateurs               :d2, after d1, 10d
    Modules Appareils & Actifs IT/Télécom    :d3, after d2, 21d
    Modules Projets & Tâches                 :d4, after d2, 14d
    Tableau de bord & monitoring live        :d5, after d3, 10d
    Import/Export Excel                      :d6, after d3, 7d
    Modes réseau & OneDrive                  :d7, after d4, 14d
    Agent IA & services arrière-plan         :d8, after d5, 7d

    section Tests & qualité
    Tests fonctionnels                       :t1, 2025-05-05, 14d
    Correctifs packaging (ffmpeg, installeur):t2, after t1, 7d
    Tests déploiement multi-postes           :t3, after t2, 7d

    section Livraison
    Documentation utilisateur              :l1, 2025-05-19, 10d
    Build installateur v1.0.1                :milestone, l2, 2025-06-02, 1d
    Rapport & soutenance                     :l3, after l1, 14d
```

---

## 9. Vue C4 — Contexte système (complément architecture)

```mermaid
C4Context
    title Diagramme de contexte — IT Suite

    Person(admin, "Administrateur", "Configure l'app et gère les utilisateurs")
    Person(tech, "Technicien IT", "Gère le parc et les tâches")
    Person(user, "Utilisateur", "Consulte et met à jour ses tâches")

    System(itsuite, "IT Suite", "Application desktop de gestion IT")

    System_Ext(onedrive, "OneDrive", "Synchronisation fichiers DB")
    System_Ext(network, "Partage réseau Windows", "Base partagée SMB")
    System_Ext(openai, "OpenAI API", "Assistant IA optionnel")

    Rel(admin, itsuite, "Utilise")
    Rel(tech, itsuite, "Utilise")
    Rel(user, itsuite, "Utilise")
    Rel(itsuite, onedrive, "Stocke DB", "Mode cloud")
    Rel(itsuite, network, "Accède DB", "Mode serveur/client")
    Rel(itsuite, openai, "Requêtes IA", "HTTPS")
```

> Si `C4Context` n’est pas supporté par votre outil, utilisez les diagrammes des sections 1 et 7.

---

## 10. Légende et export

| Diagramme | Section | Outil recommandé |
|-----------|---------|------------------|
| Architecture couches | §1 | Mermaid Live |
| Architecture composants | §2 | Mermaid Live |
| Classes métier | §3 | Mermaid / PlantUML |
| Classes services | §4 | Mermaid |
| Cas d’utilisation | §5 | Mermaid / Draw.io |
| Séquences | §6 | Mermaid Live |
| Déploiement | §7 | Mermaid / Draw.io |
| Gantt | §8 | Mermaid / MS Project |
| Contexte C4 | §9 | Mermaid 9.4+ |

**Export PDF :** ouvrir ce fichier dans VS Code avec l’extension « Markdown PDF » ou coller les blocs sur [https://mermaid.live](https://mermaid.live) puis exporter en SVG/PNG.

---

*Document généré pour IT Management Suite v1.0.1 — aligné sur le code source et `schema.sql`.*
