# GitHub Upload Helper Script
# This script will help you prepare files for GitHub upload

Write-Host "🚀 IT Management Suite - GitHub Upload Helper" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Create a temporary folder for organized upload
$tempFolder = "GitHub-Upload"
if (Test-Path $tempFolder) {
    Remove-Item $tempFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $tempFolder | Out-Null

Write-Host "📁 Creating organized upload folder..." -ForegroundColor Yellow

# Copy essential files and folders
$filesToCopy = @(
    "src",
    "electron", 
    "docs",
    "assets",
    "public",
    "package.json",
    "tsconfig.json",
    "README.md",
    "LICENSE",
    ".gitignore",
    "CONTRIBUTING.md"
)

foreach ($item in $filesToCopy) {
    if (Test-Path $item) {
        if ((Get-Item $item) -is [System.IO.DirectoryInfo]) {
            Copy-Item $item -Destination $tempFolder -Recurse
            Write-Host "✅ Copied folder: $item" -ForegroundColor Green
        } else {
            Copy-Item $item -Destination $tempFolder
            Write-Host "✅ Copied file: $item" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️  Not found: $item" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "📋 Upload Instructions:" -ForegroundColor Cyan
Write-Host "1. Go to: https://github.com/IsmailJamji/it-management-suite" -ForegroundColor White
Write-Host "2. Click 'Add file' → 'Upload files'" -ForegroundColor White
Write-Host "3. Drag and drop the '$tempFolder' folder contents" -ForegroundColor White
Write-Host "4. Add commit message: 'Initial commit: IT Management Suite v1.0.1'" -ForegroundColor White
Write-Host "5. Click 'Commit changes'" -ForegroundColor White
Write-Host ""
Write-Host "📁 Files ready in: $tempFolder" -ForegroundColor Green
Write-Host "🎯 Total files prepared: $((Get-ChildItem $tempFolder -Recurse | Measure-Object).Count)" -ForegroundColor Green

# Open the folder for easy access
Start-Process explorer.exe -ArgumentList $tempFolder

Write-Host ""
Write-Host "Ready to upload! The folder is now open in Windows Explorer." -ForegroundColor Green
