; IT Management Suite Installer Script
; This script creates a Windows installer for the IT Management Suite

!define APPNAME "IT Management Suite"
!define COMPANYNAME "IT Management Team"
!define DESCRIPTION "Comprehensive IT Management Desktop Application"
!define VERSIONMAJOR 1
!define VERSIONMINOR 0
!define VERSIONBUILD 0
!define HELPURL "https://github.com/your-org/it-management-suite"
!define UPDATEURL "https://github.com/your-org/it-management-suite/releases"
!define ABOUTURL "https://github.com/your-org/it-management-suite"
!define INSTALLSIZE 150000

RequestExecutionLevel admin
InstallDir "$PROGRAMFILES64\${APPNAME}"
Name "${APPNAME}"
Icon "assets\icon.ico"
outFile "IT-Management-Suite-Setup.exe"

!include LogicLib.nsh

page directory
page instfiles

!macro VerifyUserIsAdmin
UserInfo::GetAccountType
pop $0
${If} $0 != "admin"
    messageBox mb_iconstop "Administrator rights required!"
    setErrorLevel 740
    quit
${EndIf}
!macroend

function .onInit
    setShellVarContext all
    !insertmacro VerifyUserIsAdmin
functionEnd

section "install"
    setOutPath $INSTDIR
    
    ; Copy application files
    file /r "release\win-unpacked\*"
    
    ; Create start menu shortcuts
    createDirectory "$SMPROGRAMS\${APPNAME}"
    createShortCut "$SMPROGRAMS\${APPNAME}\${APPNAME}.lnk" "$INSTDIR\IT Management Suite.exe" "" "$INSTDIR\IT Management Suite.exe" 0
    createShortCut "$SMPROGRAMS\${APPNAME}\Uninstall.lnk" "$INSTDIR\Uninstall.exe" "" "$INSTDIR\Uninstall.exe" 0
    
    ; Create desktop shortcut
    createShortCut "$DESKTOP\${APPNAME}.lnk" "$INSTDIR\IT Management Suite.exe" "" "$INSTDIR\IT Management Suite.exe" 0
    
    ; Write uninstaller
    writeUninstaller "$INSTDIR\Uninstall.exe"
    
    ; Write registry keys for uninstaller
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayName" "${APPNAME}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "UninstallString" "$INSTDIR\Uninstall.exe"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "InstallLocation" "$INSTDIR"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayIcon" "$INSTDIR\IT Management Suite.exe"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "Publisher" "${COMPANYNAME}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "HelpLink" "${HELPURL}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "URLUpdateInfo" "${UPDATEURL}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "URLInfoAbout" "${ABOUTURL}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayVersion" "${VERSIONMAJOR}.${VERSIONMINOR}.${VERSIONBUILD}"
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "VersionMajor" ${VERSIONMAJOR}
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "VersionMinor" ${VERSIONMINOR}
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "NoModify" 1
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "NoRepair" 1
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "EstimatedSize" ${INSTALLSIZE}
    
    ; Set application to start with Windows
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "${APPNAME}" "$INSTDIR\IT Management Suite.exe --minimized"
    
    ; Set file associations
    WriteRegStr HKCR ".itms" "" "ITManagementSuite.Document"
    WriteRegStr HKCR "ITManagementSuite.Document" "" "IT Management Suite Document"
    WriteRegStr HKCR "ITManagementSuite.Document\DefaultIcon" "" "$INSTDIR\IT Management Suite.exe,0"
    WriteRegStr HKCR "ITManagementSuite.Document\shell\open\command" "" '"$INSTDIR\IT Management Suite.exe" "%1"'
    
    ; Create data directory
    createDirectory "$APPDATA\${APPNAME}"
    createDirectory "$APPDATA\${APPNAME}\logs"
    createDirectory "$APPDATA\${APPNAME}\backups"
    
    ; Set permissions
    AccessControl::GrantOnFile "$INSTDIR" "(BU)" "FullAccess"
    AccessControl::GrantOnFile "$APPDATA\${APPNAME}" "(BU)" "FullAccess"
sectionEnd

section "uninstall"
    ; Remove files
    delete "$INSTDIR\IT Management Suite.exe"
    delete "$INSTDIR\Uninstall.exe"
    rmDir /r "$INSTDIR"
    
    ; Remove shortcuts
    delete "$SMPROGRAMS\${APPNAME}\${APPNAME}.lnk"
    delete "$SMPROGRAMS\${APPNAME}\Uninstall.lnk"
    rmDir "$SMPROGRAMS\${APPNAME}"
    delete "$DESKTOP\${APPNAME}.lnk"
    
    ; Remove registry keys
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}"
    DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "${APPNAME}"
    DeleteRegKey HKCR ".itms"
    DeleteRegKey HKCR "ITManagementSuite.Document"
    
    ; Remove data directory (ask user first)
    MessageBox MB_YESNO "Do you want to remove all application data?" IDYES remove_data IDNO keep_data
    remove_data:
        rmDir /r "$APPDATA\${APPNAME}"
    keep_data:
sectionEnd
