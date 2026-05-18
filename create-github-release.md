# Create GitHub Release - IT Management Suite v1.0.1

## Release Files Location
The installer files are located in: `release/`

### Files to Upload:
1. **IT Management Suite Setup 1.0.1.exe** (80.9 MB) - Windows Installer
2. **IT-Management-Suite-Portable.exe** (80.8 MB) - Portable Version

## Steps to Create Release:

### 1. Go to GitHub Repository
Visit: https://github.com/IsmailJamji/it-management-suite

### 2. Create New Release
1. Click on **"Releases"** tab
2. Click **"Create a new release"**
3. Click **"Choose a tag"** and create tag: `v1.0.1`
4. Set release title: `IT Management Suite v1.0.1`
5. Set description:

```
## 🎉 IT Management Suite v1.0.1

### ✨ New Features
- **Enhanced Excel Export**: Now supports multiple languages (French, Spanish, English)
- **Language-based Column Headers**: Excel exports automatically use your selected language
- **Updated Field Mappings**: All new database fields are properly exported
- **Improved User Interface**: Cleaner navigation and better user experience

### 🗑️ Removed Features
- **AI Assistant Tab**: Removed from navigation (as requested)

### 📦 Installation Options
- **Windows Installer**: Full installation with desktop shortcuts
- **Portable Version**: Run directly without installation

### 🔧 Technical Improvements
- Updated Excel export service with comprehensive translations
- Enhanced IPC communication for language support
- Improved TypeScript definitions
- Better error handling and user feedback

### 📋 System Requirements
- Windows 10/11
- .NET Framework 4.7.2 or later
- 100 MB free disk space

### 🚀 Getting Started
1. Download the installer or portable version
2. Run the executable
3. Choose your preferred language
4. Start managing your IT assets!

---
**Note**: This release includes all the latest improvements and language support for Excel exports.
```

### 3. Upload Files
1. Drag and drop both `.exe` files to the release
2. Wait for upload to complete
3. Click **"Publish release"**

## Alternative: Using GitHub CLI (if installed)
```bash
# Install GitHub CLI first
winget install GitHub.cli

# Then create release
gh release create v1.0.1 \
  "release/IT Management Suite Setup 1.0.1.exe" \
  "release/IT-Management-Suite-Portable.exe" \
  --title "IT Management Suite v1.0.1" \
  --notes "Enhanced Excel export with language support and removed AI assistant tab"
```

## File Sizes
- **Setup Installer**: ~81 MB
- **Portable Version**: ~81 MB

Both files are ready for upload to GitHub Releases!
