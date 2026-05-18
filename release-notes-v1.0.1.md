## IT Suite v1.0.1 — Application de bureau Windows

### Nouveautés
- **Branding IT Suite** : icône, thème CloudCash, interface login épurée
- **OneDrive entreprise** : détection `OneDrive - DISTRA`, création auto de `IT-Management-Cloud\it_management.db`
- **Tableau de bord** : graphiques CPU / RAM / disque en temps réel
- **Paramètres base de données** : chargement asynchrone (plus de freeze UI)
- **Packaging** : correctif `ffmpeg.dll` et DLL Chromium pour le lancement Windows

### Fichiers à télécharger
| Fichier | Description |
|---------|-------------|
| **IT Suite Setup 1.0.1.exe** | Installateur Windows (NSIS) |
| **IT-Suite-Portable.exe** | Version portable sans installation |

### Prérequis
- Windows 10/11 (64 bits)
- ~500 Mo d'espace disque

### Démarrage
1. Téléchargez l'installateur ou la version portable
2. Lancez l'exécutable
3. Connectez-vous : `admin@itmanagement.com` / `admin123` (à changer en production)
4. **Paramètres → Database → Setup OneDrive** pour la sync cloud (optionnel)

### Code source
Dépôt : https://github.com/IsmailJamji/it-management-suite
