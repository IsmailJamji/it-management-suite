# IT Management Suite - Network Setup Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Network Architecture](#network-architecture)
3. [Server PC Configuration](#server-pc-configuration)
4. [Client PC Configuration](#client-pc-configuration)
5. [Network Security](#network-security)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## 🎯 Overview

This guide explains how to set up IT Management Suite for multi-user network operation, allowing multiple PCs to share data in real-time.

### Network Benefits:
- **Real-time Data Sync** - Changes appear instantly on all PCs
- **Centralized Management** - Single database for all users
- **Collaborative Work** - Multiple users can work simultaneously
- **Data Security** - Centralized backup and access control
- **Scalability** - Easy to add more users and PCs

### Network Requirements:
- **Same Network** - All PCs must be on the same local network
- **Windows File Sharing** - Must be enabled on server PC
- **Firewall Configuration** - Allow application through firewall
- **User Permissions** - Proper access rights for shared folders

---

## 🏗️ Network Architecture

### Basic Setup:
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Server PC     │    │   Client PC 1   │    │   Client PC 2   │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │ Database  │  │◄───┤  │IT Suite   │  │    │  │IT Suite   │  │
│  │ (Shared)  │  │    │  │(Client)   │  │    │  │(Client)   │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │                 │    │                 │
│  │IT Suite   │  │    │                 │    │                 │
│  │(Server)   │  │    │                 │    │                 │
│  └───────────┘  │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        ▲                        ▲                        ▲
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Router/Switch │
                    │   (Network Hub) │
                    └─────────────────┘
```

### Data Flow:
1. **Server PC** hosts the shared database
2. **Client PCs** connect to server's database
3. **Real-time sync** keeps all data current
4. **Offline support** works when server unavailable
5. **Auto-reconnect** restores connection when server returns

---

## 🖥️ Server PC Configuration

### Step 1: Choose Your Server PC

**Select the best PC for server role:**
- **Most Powerful** - Best performance for multiple connections
- **Always On** - Stays running most of the time
- **Stable Network** - Reliable network connection
- **Sufficient Storage** - Space for database and backups
- **Central Location** - Accessible to all users

### Step 2: Install in Server Mode

1. **Run** `IT Management Suite Setup 1.0.0.exe`
2. **Choose** "Server Mode" during installation
3. **App creates** shared folder automatically
4. **Configure** Windows file sharing
5. **Set up** user permissions

### Step 3: Configure Windows File Sharing

#### Enable File Sharing:
1. **Open** Windows Settings (Win + I)
2. **Go to** Network & Internet
3. **Click** "Network and Sharing Center"
4. **Click** "Change advanced sharing settings"
5. **Expand** "Private" profile
6. **Enable** "Turn on file and printer sharing"
7. **Enable** "Turn on network discovery"
8. **Click** "Save changes"

#### Share Database Folder:
1. **Navigate** to: `C:\Users\[User]\Documents\IT-Management-Data\`
2. **Right-click** on the folder
3. **Select** "Properties"
4. **Go to** "Sharing" tab
5. **Click** "Advanced Sharing..."
6. **Check** "Share this folder"
7. **Set** Share name: "IT-Management-Data"
8. **Click** "Permissions"
9. **Add** "Everyone" with "Full Control"
10. **Click** "OK" to save

### Step 4: Configure Windows Firewall

#### Allow Application Through Firewall:
1. **Open** Windows Defender Firewall
2. **Click** "Allow an app or feature through Windows Defender Firewall"
3. **Click** "Change settings"
4. **Click** "Allow another app..."
5. **Browse** to IT Management Suite executable
6. **Add** the application
7. **Check** both "Private" and "Public" boxes
8. **Click** "OK"

#### Allow File Sharing:
1. **In Windows Defender Firewall**
2. **Click** "Advanced settings"
3. **Click** "Inbound Rules"
4. **Find** "File and Printer Sharing"
5. **Enable** all related rules
6. **Repeat** for "Outbound Rules"

### Step 5: Test Server Configuration

#### Verify Sharing:
1. **Open** File Explorer
2. **Navigate** to: `\\[ServerPCName]\IT-Management-Data\`
3. **Check** if you can access the folder
4. **Verify** you can see `it_management.db` file
5. **Test** creating a test file (delete after testing)

#### Test Application:
1. **Launch** IT Management Suite
2. **Login** with default credentials
3. **Add** a test asset
4. **Verify** data is saved
5. **Check** shared folder for database updates

---

## 💻 Client PC Configuration

### Step 1: Install in Client Mode

1. **Run** `IT Management Suite Setup 1.0.0.exe`
2. **Choose** "Client Mode" during installation
3. **App scans** for available servers
4. **Select** your server PC from the list
5. **Test** connection to server

### Step 2: Server Discovery

#### Automatic Discovery:
1. **App scans** local network automatically
2. **Shows** available servers with status
3. **Displays** server name and IP address
4. **Indicates** connection status (online/offline)
5. **Allows** selection of preferred server

#### Manual Server Entry:
If automatic discovery fails:
1. **Click** "Manual Entry"
2. **Enter** server PC name or IP address
3. **Test** connection to server
4. **Verify** access to shared database
5. **Save** server configuration

### Step 3: Configure Connection

#### Connection Settings:
1. **Set** auto-reconnection on startup
2. **Configure** connection timeout
3. **Enable** offline mode when server unavailable
4. **Set** data sync frequency
5. **Configure** error handling

#### User Permissions:
1. **Verify** user account exists on server
2. **Check** access permissions
3. **Test** data read/write access
4. **Configure** user-specific settings
5. **Set** data synchronization preferences

### Step 4: Test Client Connection

#### Verify Data Sync:
1. **Launch** IT Management Suite
2. **Login** with user credentials
3. **Check** if data from server appears
4. **Add** a test asset
5. **Verify** data appears on server PC

#### Test Real-time Updates:
1. **Open** IT Management Suite on server PC
2. **Add** a new asset
3. **Check** if it appears on client PC
4. **Modify** an asset on client PC
5. **Verify** changes appear on server PC

---

## 🔒 Network Security

### Access Control

#### User Management:
1. **Create** user accounts on server PC
2. **Set** appropriate permissions
3. **Configure** role-based access
4. **Monitor** user activity
5. **Regular** access reviews

#### Folder Permissions:
1. **Set** specific user permissions
2. **Remove** "Everyone" access if needed
3. **Use** specific user groups
4. **Regular** permission audits
5. **Document** access policies

### Data Protection

#### Backup Strategy:
1. **Regular** database backups
2. **Offsite** backup storage
3. **Test** backup restoration
4. **Document** backup procedures
5. **Monitor** backup success

#### Encryption:
1. **Enable** database encryption
2. **Use** secure network protocols
3. **Implement** data transmission security
4. **Regular** security updates
5. **Monitor** security logs

### Network Security

#### Firewall Configuration:
1. **Allow** only necessary ports
2. **Block** unnecessary network access
3. **Monitor** network traffic
4. **Regular** security reviews
5. **Update** firewall rules

#### Network Monitoring:
1. **Monitor** network performance
2. **Track** connection status
3. **Alert** on connection failures
4. **Log** network activity
5. **Regular** network health checks

---

## 🔧 Troubleshooting

### Common Network Issues

#### "Cannot Connect to Server"
**Symptoms**:
- Client cannot find server
- Connection timeout errors
- "Server not found" messages

**Diagnosis**:
1. **Check** server PC is running
2. **Verify** both PCs on same network
3. **Test** basic network connectivity
4. **Check** Windows file sharing
5. **Verify** firewall settings

**Solutions**:
1. **Restart** server application
2. **Check** network configuration
3. **Enable** network discovery
4. **Configure** firewall properly
5. **Use** manual server entry

#### "Access Denied" Errors
**Symptoms**:
- Permission denied messages
- Cannot access shared folder
- Authentication failures

**Diagnosis**:
1. **Check** user account exists
2. **Verify** folder permissions
3. **Test** with different user
4. **Check** Windows sharing settings
5. **Verify** user credentials

**Solutions**:
1. **Create** proper user account
2. **Set** correct permissions
3. **Use** administrator account
4. **Reconfigure** sharing
5. **Reset** user permissions

#### "Data Not Syncing"
**Symptoms**:
- Changes not appearing on other PCs
- Outdated data display
- Sync errors

**Diagnosis**:
1. **Check** network connectivity
2. **Verify** database access
3. **Test** file permissions
4. **Check** application status
5. **Monitor** error logs

**Solutions**:
1. **Restart** applications
2. **Check** network connection
3. **Verify** database integrity
4. **Force** data refresh
5. **Reconfigure** connection

### Performance Issues

#### Slow Data Sync
**Causes**:
- Network latency
- Large database size
- Multiple simultaneous users
- Insufficient server resources

**Solutions**:
1. **Optimize** network configuration
2. **Upgrade** network hardware
3. **Limit** concurrent users
4. **Optimize** database
5. **Upgrade** server hardware

#### Connection Drops
**Causes**:
- Network instability
- Server overload
- Firewall interference
- Power management

**Solutions**:
1. **Check** network stability
2. **Optimize** server performance
3. **Configure** firewall properly
4. **Disable** power saving
5. **Implement** auto-reconnect

---

## 📋 Best Practices

### Server Management

#### Regular Maintenance:
1. **Daily** - Check server status
2. **Weekly** - Review error logs
3. **Monthly** - Database optimization
4. **Quarterly** - Security review
5. **Annually** - Hardware assessment

#### Backup Procedures:
1. **Daily** - Automated database backup
2. **Weekly** - Full system backup
3. **Monthly** - Offsite backup
4. **Test** - Regular restore testing
5. **Document** - Backup procedures

### User Management

#### Account Security:
1. **Strong** passwords required
2. **Regular** password changes
3. **Role-based** access control
4. **Monitor** user activity
5. **Disable** unused accounts

#### Training:
1. **User** training sessions
2. **Documentation** provided
3. **Best practices** shared
4. **Regular** updates
5. **Support** available

### Network Optimization

#### Performance Tuning:
1. **Optimize** network settings
2. **Monitor** bandwidth usage
3. **Upgrade** hardware as needed
4. **Implement** QoS policies
5. **Regular** performance reviews

#### Monitoring:
1. **Real-time** status monitoring
2. **Alert** on issues
3. **Log** all activities
4. **Regular** health checks
5. **Proactive** maintenance

---

## 📞 Support

### Getting Help
- **Network Guide**: This comprehensive setup guide
- **Installation Guide**: Basic installation instructions
- **User Manual**: Feature usage guide
- **Troubleshooting**: Common issue solutions

### Contact Information
- **Email**: support@itmanagement.com
- **Documentation**: Available in docs folder
- **Version**: 1.0.0
- **Last Updated**: 2024

### Network Information
When requesting support, please provide:
- **Network Topology**: Server and client configuration
- **Windows Versions**: All PCs involved
- **Network Type**: Wired/Wi-Fi, router model
- **Error Messages**: Exact text and screenshots
- **Network Status**: Connectivity test results

---

*This network setup guide covers all aspects of configuring IT Management Suite for multi-user operation. For basic installation, refer to the Installation Guide.*










