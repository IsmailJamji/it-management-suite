# GitHub Release Creation Script
# This script helps create a GitHub release with the installer files

Write-Host "🚀 Creating GitHub Release for IT Management Suite v1.0.1" -ForegroundColor Green

# Check if release files exist
$setupFile = "release\IT Management Suite Setup 1.0.1.exe"
$portableFile = "release\IT-Management-Suite-Portable.exe"

if (-not (Test-Path $setupFile)) {
    Write-Host "❌ Setup file not found: $setupFile" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $portableFile)) {
    Write-Host "❌ Portable file not found: $portableFile" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Release files found:" -ForegroundColor Green
Write-Host "   - Setup: $setupFile ($((Get-Item $setupFile).Length / 1MB | ForEach-Object {[math]::Round($_, 1)}) MB)" -ForegroundColor Cyan
Write-Host "   - Portable: $portableFile ($((Get-Item $portableFile).Length / 1MB | ForEach-Object {[math]::Round($_, 1)}) MB)" -ForegroundColor Cyan

Write-Host "`n📋 Manual Steps to Create Release:" -ForegroundColor Yellow
Write-Host "1. Go to: https://github.com/IsmailJamji/it-management-suite" -ForegroundColor White
Write-Host "2. Click 'Releases' tab" -ForegroundColor White
Write-Host "3. Click 'Create a new release'" -ForegroundColor White
Write-Host "4. Create tag: v1.0.1" -ForegroundColor White
Write-Host "5. Title: IT Management Suite v1.0.1" -ForegroundColor White
Write-Host "6. Upload both .exe files from the release/ directory" -ForegroundColor White
Write-Host "7. Publish release" -ForegroundColor White

Write-Host "`n📝 Release Description:" -ForegroundColor Yellow
$description = @"
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
"@

Write-Host $description -ForegroundColor White

Write-Host "`n🎯 Files to Upload:" -ForegroundColor Yellow
Write-Host "   📁 $setupFile" -ForegroundColor Cyan
Write-Host "   📁 $portableFile" -ForegroundColor Cyan

Write-Host "`n✅ Ready to create release!" -ForegroundColor Green
