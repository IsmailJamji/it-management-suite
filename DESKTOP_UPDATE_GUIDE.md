# Desktop App Auto-Update Guide

## How Desktop App Updates Work

Your IT Management Suite desktop app now has automatic update functionality built-in. Here's how it works:

### 1. Automatic Update Process

- **Startup Check**: App automatically checks for updates when launched
- **Background Download**: Updates download in the background
- **User Notification**: Users get notified when updates are ready
- **One-Click Install**: Users can restart to install updates instantly

### 2. Update Distribution Methods

#### Method A: GitHub Releases (Recommended)
```bash
# Build and publish to GitHub
npm run dist

# This creates:
# - Windows: IT-Management-Suite-Setup-1.0.1.exe
# - Portable: IT-Management-Suite-Portable.exe
```

#### Method B: Manual Distribution
```bash
# Build without publishing
npm run build:installer

# Distribute the installer files manually
```

### 3. Setting Up GitHub Releases

1. **Create GitHub Repository**:
   - Create a public repository on GitHub
   - Update `package.json` with your GitHub details:
   ```json
   "publish": {
     "provider": "github",
     "owner": "your-github-username",
     "repo": "it-management-suite"
   }
   ```

2. **Generate GitHub Token**:
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Create token with `repo` permissions
   - Set environment variable: `GH_TOKEN=your_token`

3. **Publish Updates**:
   ```bash
   # Set your GitHub token
   set GH_TOKEN=your_github_token_here
   
   # Build and publish
   npm run dist
   ```

### 4. User Experience

#### For Users:
1. **Automatic Notifications**: Users see update notifications
2. **No Data Loss**: Updates preserve all user data and settings
3. **Seamless Installation**: One-click restart to install
4. **Manual Check**: Users can manually check for updates

#### Update Notification UI:
- Shows when updates are available
- Displays download progress
- Prompts to restart and install
- Allows dismissing for later

### 5. Desktop App Specific Features

#### Windows Desktop App:
- **NSIS Installer**: Full installation with shortcuts
- **Portable Version**: No installation required
- **Auto-Update**: Works with both installer and portable versions
- **Registry Integration**: Proper Windows integration

#### Update Behavior:
- **Silent Updates**: Downloads happen in background
- **User Control**: Users choose when to install
- **Rollback Protection**: Previous version preserved
- **Network Awareness**: Only checks when online

### 6. Building for Distribution

```bash
# Development build (no auto-updater)
npm run dev

# Production build with auto-updater
npm run dist

# Portable version (no installation)
npm run dist:portable

# NSIS installer (full installation)
npm run dist:nsis
```

### 7. Testing Updates

1. **Version Bump**: Update version in `package.json`
2. **Build New Version**: `npm run dist`
3. **Test Update Flow**: Install old version, then new version
4. **Verify Auto-Update**: Check if update notification appears

### 8. Desktop App Benefits

✅ **No Reinstallation**: Updates install over existing installation
✅ **Data Preservation**: All user data and settings preserved
✅ **Automatic Notifications**: Users informed of available updates
✅ **Background Downloads**: No interruption to user workflow
✅ **Professional Experience**: Similar to major desktop applications
✅ **Cross-Platform**: Works on Windows, Mac, and Linux

### 9. Troubleshooting

#### If Updates Don't Work:
1. Check GitHub repository is public
2. Verify GitHub token has correct permissions
3. Ensure version number is incremented
4. Check network connectivity

#### Manual Update Process:
If auto-update fails, users can:
1. Download new installer from GitHub releases
2. Run installer (it will update existing installation)
3. No data loss or reconfiguration needed

### 10. Security Considerations

- **Code Signing**: Consider signing your app for Windows
- **HTTPS**: All update downloads use HTTPS
- **Verification**: Updates are verified before installation
- **User Control**: Users can disable auto-updates if needed

## Quick Start for Desktop Updates

1. **Update your GitHub details** in `package.json`
2. **Set GitHub token**: `set GH_TOKEN=your_token`
3. **Build and publish**: `npm run dist`
4. **Users get automatic updates!**

Your desktop app now has professional-grade auto-update functionality!
