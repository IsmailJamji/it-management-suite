# IT Management Suite - Installation Guide

## 📋 Table of Contents
1. [System Requirements](#system-requirements)
2. [Download & Installation](#download--installation)
3. [Installation Modes](#installation-modes)
4. [First Time Setup](#first-time-setup)
5. [Network Configuration](#network-configuration)
6. [Troubleshooting](#troubleshooting)
7. [Uninstallation](#uninstallation)

---

## 💻 System Requirements

### Minimum Requirements:
- **Operating System**: Windows 10 (64-bit) or Windows 11
- **Processor**: Intel Core i3 or AMD equivalent
- **Memory**: 4GB RAM
- **Storage**: 500MB free disk space
- **Network**: Ethernet or Wi-Fi connection (for multi-user features)

### Recommended Requirements:
- **Operating System**: Windows 11 (64-bit)
- **Processor**: Intel Core i5 or AMD equivalent
- **Memory**: 8GB RAM or more
- **Storage**: 2GB free disk space
- **Network**: Gigabit Ethernet connection
- **Graphics**: DirectX 11 compatible

### Network Requirements (Multi-user):
- **Same Network**: All PCs must be on the same local network
- **File Sharing**: Windows file sharing must be enabled
- **Firewall**: Allow application through Windows Firewall
- **Permissions**: Read/Write access to shared folders

---

## 📥 Download & Installation

### Step 1: Download
1. **Locate** the installer file: `IT Management Suite Setup 1.0.0.exe`
2. **Verify** file size: ~94MB
3. **Check** file location: `C:\Users\[User]\Desktop\App\IT central FINAL\release\`

### Step 2: Run Installer
1. **Right-click** on `IT Management Suite Setup 1.0.0.exe`
2. **Select** "Run as administrator"
3. **Click** "Yes" when prompted by User Account Control
4. **Wait** for the installer to load

### Step 3: Installation Wizard
1. **Welcome Screen** - Click "Next"
2. **License Agreement** - Read and accept terms
3. **Installation Location** - Choose destination folder
4. **Start Menu Folder** - Select program group
5. **Desktop Shortcut** - Choose shortcut options
6. **Ready to Install** - Review settings and click "Install"

### Step 4: Complete Installation
1. **Wait** for installation to complete
2. **Click** "Finish" when done
3. **Launch** application from desktop shortcut

---

## 🎯 Installation Modes

The application offers three installation modes to suit different needs:

### Server Mode
**Purpose**: Host the shared database for other PCs to connect to

**When to Use**:
- Setting up a multi-user environment
- Central data management
- Team collaboration
- Data backup and security

**What Happens**:
- Creates shared database folder: `C:\Users\[User]\Documents\IT-Management-Data\`
- Sets up network sharing
- Configures database for multiple connections
- Enables real-time data synchronization

**Requirements**:
- Stable network connection
- Sufficient storage space
- Regular backup schedule
- User access management

### Client Mode
**Purpose**: Connect to an existing server PC

**When to Use**:
- Joining an existing IT Management Suite network
- Accessing shared data
- Collaborative work environment
- Mobile or temporary workstations

**What Happens**:
- Scans network for available servers
- Connects to chosen server's database
- Syncs data in real-time
- Works offline when server unavailable

**Requirements**:
- Network connection to server PC
- Server PC must be running
- Proper user permissions
- Firewall configuration

### Local Mode
**Purpose**: Standalone operation without network sharing

**When to Use**:
- Single-user environment
- No network requirements
- Testing or development
- Personal use only

**What Happens**:
- Creates local database
- No network dependencies
- Independent operation
- Data stays on this PC only

**Requirements**:
- No special network setup
- Local storage only
- Single user access
- Manual data backup

---

## 🚀 First Time Setup

### Step 1: Launch Application
1. **Double-click** desktop shortcut
2. **Wait** for application to load
3. **Installation Wizard** will appear (first time only)

### Step 2: Choose Installation Mode
```
┌─────────────────────────────────────────┐
│  IT Management Suite - Installation     │
├─────────────────────────────────────────┤
│  Choose your installation mode:         │
│                                         │
│  ○ Server Mode                          │
│    (This PC will host the database)     │
│                                         │
│  ○ Client Mode                          │
│    (Connect to existing server)         │
│                                         │
│  ○ Local Mode                           │
│    (Standalone, no sharing)             │
│                                         │
│  [Continue] [Cancel]                    │
└─────────────────────────────────────────┘
```

### Step 3: Server Mode Setup
If you chose **Server Mode**:
1. **App creates** shared folder automatically
2. **Configure** Windows file sharing
3. **Set permissions** for other users
4. **Test** network access
5. **Create** initial admin user

### Step 4: Client Mode Setup
If you chose **Client Mode**:
1. **App scans** network for servers
2. **Select** your server PC from the list
3. **Test** connection to server
4. **Configure** automatic reconnection
5. **Sync** initial data

### Step 5: Local Mode Setup
If you chose **Local Mode**:
1. **App creates** local database
2. **Set up** initial configuration
3. **Create** admin user account
4. **Ready** to use immediately

---

## 🌐 Network Configuration

### Server PC Setup

#### Step 1: Enable File Sharing
1. **Open** Windows Settings
2. **Go to** Network & Internet
3. **Click** "Network and Sharing Center"
4. **Click** "Change advanced sharing settings"
5. **Enable** "Turn on file and printer sharing"
6. **Save** changes

#### Step 2: Share Database Folder
1. **Navigate** to `C:\Users\[User]\Documents\IT-Management-Data\`
2. **Right-click** on the folder
3. **Select** "Properties"
4. **Go to** "Sharing" tab
5. **Click** "Advanced Sharing"
6. **Check** "Share this folder"
7. **Set** permissions for "Everyone" (Read/Write)
8. **Click** "OK" to save

#### Step 3: Configure Firewall
1. **Open** Windows Defender Firewall
2. **Click** "Allow an app or feature through Windows Defender Firewall"
3. **Click** "Change settings"
4. **Find** "IT Management Suite"
5. **Check** both "Private" and "Public" boxes
6. **Click** "OK"

### Client PC Setup

#### Step 1: Connect to Network
1. **Ensure** you're on the same network as server
2. **Check** network connectivity
3. **Verify** server PC is running
4. **Test** basic network access

#### Step 2: Configure Application
1. **Launch** IT Management Suite
2. **Choose** "Client Mode"
3. **Select** server from discovered list
4. **Test** connection
5. **Configure** auto-reconnection

#### Step 3: Verify Connection
1. **Check** data synchronization
2. **Test** real-time updates
3. **Verify** user permissions
4. **Confirm** offline capability

---

## 🔧 Troubleshooting

### Installation Issues

#### "Installation Failed"
**Causes**:
- Insufficient permissions
- Antivirus interference
- Corrupted installer
- Insufficient disk space

**Solutions**:
1. **Run as Administrator**
2. **Disable antivirus** temporarily
3. **Re-download** installer
4. **Free up** disk space
5. **Check** Windows version compatibility

#### "Database Initialization Failed"
**Causes**:
- Permission issues
- Corrupted database files
- Insufficient memory
- Network problems

**Solutions**:
1. **Check** folder permissions
2. **Delete** old database files
3. **Restart** application
4. **Verify** network connection
5. **Contact** technical support

### Network Issues

#### "Cannot Connect to Server"
**Causes**:
- Server PC offline
- Network connectivity issues
- Firewall blocking
- Permission problems

**Solutions**:
1. **Check** server PC status
2. **Verify** network connection
3. **Configure** firewall settings
4. **Check** shared folder permissions
5. **Restart** both applications

#### "Server Not Found"
**Causes**:
- Network discovery disabled
- Different network segments
- Server not running
- Firewall blocking discovery

**Solutions**:
1. **Enable** network discovery
2. **Check** network configuration
3. **Verify** server is running
4. **Use** manual server entry
5. **Check** firewall settings

### Performance Issues

#### "Application Running Slow"
**Causes**:
- Insufficient system resources
- Large database size
- Network latency
- Background processes

**Solutions**:
1. **Close** other applications
2. **Check** available memory
3. **Optimize** database
4. **Check** network speed
5. **Restart** application

#### "Data Not Syncing"
**Causes**:
- Network connectivity issues
- Database locks
- Permission problems
- Server overload

**Solutions**:
1. **Check** network connection
2. **Restart** application
3. **Verify** permissions
4. **Check** server status
5. **Force** data refresh

---

## 🗑️ Uninstallation

### Standard Uninstallation
1. **Open** Windows Settings
2. **Go to** Apps & Features
3. **Find** "IT Management Suite"
4. **Click** "Uninstall"
5. **Follow** the uninstall wizard
6. **Restart** computer

### Complete Removal
1. **Uninstall** application normally
2. **Delete** remaining folders:
   - `C:\Users\[User]\AppData\Roaming\IT-Management-Suite\`
   - `C:\Users\[User]\Documents\IT-Management-Data\` (if local mode)
3. **Remove** registry entries (advanced users)
4. **Clean** temporary files
5. **Restart** computer

### Data Backup Before Uninstall
1. **Export** all data to Excel
2. **Backup** database files
3. **Save** configuration settings
4. **Document** custom settings
5. **Store** backup in safe location

---

## 📞 Support

### Getting Help
- **User Manual**: Comprehensive feature guide
- **Network Guide**: Multi-user setup instructions
- **Troubleshooting**: Common issue solutions
- **Technical Support**: Contact information

### Contact Information
- **Email**: support@itmanagement.com
- **Documentation**: Available in docs folder
- **Version**: 1.0.0
- **Last Updated**: 2024

### System Information
When requesting support, please provide:
- **Windows Version**: (e.g., Windows 11 22H2)
- **Application Version**: 1.0.0
- **Installation Mode**: Server/Client/Local
- **Error Messages**: Exact text and screenshots
- **System Specs**: RAM, CPU, available disk space

---

*This installation guide covers all aspects of setting up IT Management Suite. For specific network configurations, refer to the Network Setup Guide.*











