# 🔧 Client-Server Connection Troubleshooting Guide

## 🚨 **Common Connection Issues & Solutions**

### **Issue 1: "Cannot ping server"**
**Problem**: Client cannot reach the server PC
**Solutions**:
1. **Check Network Connection**
   - Ensure both PCs are on the same network
   - Verify WiFi/Ethernet connection is active
   - Test with `ping [server-ip]` in Command Prompt

2. **Firewall Settings**
   - Disable Windows Firewall temporarily to test
   - Add IT Management Suite to firewall exceptions
   - Allow "File and Printer Sharing" through firewall

### **Issue 2: "Cannot resolve server name"**
**Problem**: Client cannot find server by computer name
**Solutions**:
1. **Use IP Address Instead**
   - Enter server IP address instead of computer name
   - Find server IP: `ipconfig` in Command Prompt on server PC

2. **Network Discovery**
   - Enable "Network Discovery" in Windows
   - Turn on "File and Printer Sharing"
   - Set network profile to "Private" (not Public)

### **Issue 3: "Cannot access shared folder"**
**Problem**: Client cannot access the IT-Management-Data folder
**Solutions**:

#### **On Server PC:**
1. **Create Shared Folder**
   ```
   C:\Users\[Username]\Documents\IT-Management-Data\
   ```

2. **Share the Folder**
   - Right-click folder → Properties → Sharing
   - Click "Advanced Sharing"
   - Check "Share this folder"
   - Set permissions for "Everyone" (Read/Write)

3. **Set Folder Permissions**
   - Right-click folder → Properties → Security
   - Add "Everyone" with "Full Control"
   - Apply to all subfolders and files

#### **On Client PC:**
1. **Test Network Access**
   - Open File Explorer
   - Navigate to `\\[server-name]\IT-Management-Data\`
   - Or try `\\[server-ip]\IT-Management-Data\`

2. **Authentication**
   - Use same Windows user account on both PCs
   - Or create matching user accounts
   - Enable "Guest" account if needed

### **Issue 4: "Database file not found"**
**Problem**: Database file doesn't exist on server
**Solutions**:
1. **Server Must Run First**
   - Start IT Management Suite on server PC
   - Set mode to "Server" 
   - Let it create the database file

2. **Check Database Location**
   - Look for `it_management.db` in shared folder
   - Verify file permissions allow read/write access

## 🛠️ **Step-by-Step Setup Guide**

### **Server PC Setup:**
1. **Install IT Management Suite**
2. **Set Mode to "Server"**
3. **Create Shared Folder**:
   ```
   C:\Users\[Username]\Documents\IT-Management-Data\
   ```
4. **Share the Folder**:
   - Right-click → Properties → Sharing
   - Advanced Sharing → Share this folder
   - Permissions: Everyone (Full Control)
5. **Configure Firewall**:
   - Allow IT Management Suite through firewall
   - Enable File and Printer Sharing
6. **Test Server**:
   - Launch application
   - Add a test asset
   - Verify database file is created

### **Client PC Setup:**
1. **Install IT Management Suite**
2. **Set Mode to "Client"**
3. **Enter Server Details**:
   - Server Name: Computer name or IP
   - Server IP: IP address of server PC
4. **Test Connection**:
   - Use "Diagnose Connection" button
   - Check all tests pass
5. **Connect to Server**:
   - Click "Apply Changes"
   - Verify data syncs from server

## 🔍 **Diagnostic Tools**

### **Built-in Diagnostics:**
- **Ping Test**: Checks if server is reachable
- **Name Resolution**: Verifies server name works
- **Path Access**: Tests shared folder access
- **Database Check**: Confirms database file exists

### **Manual Tests:**
1. **Test Network Connectivity**:
   ```cmd
   ping [server-ip]
   ```

2. **Test File Sharing**:
   ```cmd
   dir \\[server-name]\IT-Management-Data\
   ```

3. **Check Server Status**:
   - Server PC must be online
   - IT Management Suite must be running
   - Database file must exist

## 🚀 **Quick Fixes**

### **If Connection Still Fails:**
1. **Restart Both PCs**
2. **Run as Administrator**
3. **Check Windows Updates**
4. **Disable Antivirus Temporarily**
5. **Use IP Address Instead of Computer Name**
6. **Verify Both PCs on Same Network**

### **Alternative Solutions:**
1. **Use Local Mode** if network issues persist
2. **Manual Database Sync** using USB drive
3. **Cloud Storage** for shared database
4. **VPN Connection** for remote access

## 📞 **Still Having Issues?**

### **Check These Settings:**
- ✅ Both PCs on same network
- ✅ Windows Firewall configured
- ✅ File sharing enabled
- ✅ User permissions set
- ✅ Server PC running in Server mode
- ✅ Database file exists and accessible

### **Common Mistakes:**
- ❌ Using Public network profile
- ❌ Firewall blocking connections
- ❌ Wrong server name/IP
- ❌ Server not in Server mode
- ❌ Database file not shared
- ❌ User account mismatch

---

**💡 Tip**: Use the "Diagnose Connection" button in the login page for automated troubleshooting!





