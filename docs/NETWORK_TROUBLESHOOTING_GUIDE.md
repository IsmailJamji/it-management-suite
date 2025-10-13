# 🔧 Complete Network Troubleshooting Guide

## 🚨 **Step-by-Step Network Fix for Client-Server Connection**

### **Phase 1: Basic Network Verification**

#### **Step 1: Check Network Connection**
```cmd
# On both PCs, open Command Prompt as Administrator
ipconfig
```
**Look for:**
- Both PCs have IP addresses starting with same numbers (e.g., 192.168.1.x)
- Both are connected to same network
- No "Media disconnected" messages

#### **Step 2: Test Basic Connectivity**
```cmd
# On Client PC, test ping to server
ping [server-ip-address]
ping [server-computer-name]
```
**Expected result:** Should get replies, not "Request timed out"

---

### **Phase 2: Windows Network Services**

#### **Step 3: Enable Network Discovery**
**On Both PCs:**
1. **Open Control Panel** → **Network and Sharing Center**
2. **Click "Change advanced sharing settings"**
3. **Expand "Private" profile**
4. **Turn ON:**
   - Network Discovery
   - File and Printer Sharing
   - Turn on password protected sharing
5. **Click "Save changes"**

#### **Step 4: Set Network Profile to Private**
**On Both PCs:**
1. **Open Settings** → **Network & Internet** → **Wi-Fi**
2. **Click on your network name**
3. **Set Network profile to "Private"** (not Public)

#### **Step 5: Enable Required Services**
**On Both PCs, open Services (services.msc):**
1. **Start these services:**
   - **Server** (should be running)
   - **Workstation** (should be running)
   - **Computer Browser** (should be running)
   - **TCP/IP NetBIOS Helper** (should be running)

---

### **Phase 3: Windows Firewall Configuration**

#### **Step 6: Configure Windows Firewall**
**On Both PCs:**
```cmd
# Run as Administrator in Command Prompt
netsh advfirewall firewall set rule group="File and Printer Sharing" new enable=Yes
netsh advfirewall firewall set rule group="Network Discovery" new enable=Yes
```

**Or manually:**
1. **Open Windows Defender Firewall**
2. **Click "Allow an app or feature through Windows Defender Firewall"**
3. **Click "Change settings"**
4. **Enable:**
   - File and Printer Sharing
   - Network Discovery
   - Windows Management Instrumentation (WMI)

#### **Step 7: Create Firewall Rules**
**On Server PC:**
```cmd
# Run as Administrator
netsh advfirewall firewall add rule name="IT Management Suite Server" dir=in action=allow protocol=TCP localport=445
netsh advfirewall firewall add rule name="IT Management Suite Server UDP" dir=in action=allow protocol=UDP localport=445
```

---

### **Phase 4: File Sharing Configuration**

#### **Step 8: Create Shared Folder on Server**
**On Server PC:**
1. **Create folder:** `C:\IT-Management-Data`
2. **Right-click folder** → **Properties** → **Sharing**
3. **Click "Advanced Sharing"**
4. **Check "Share this folder"**
5. **Click "Permissions"**
6. **Add "Everyone" with "Full Control"**
7. **Click "Security" tab**
8. **Add "Everyone" with "Full Control"**
9. **Apply to all subfolders and files**

#### **Step 9: Test File Sharing**
**On Client PC:**
1. **Open File Explorer**
2. **Type in address bar:** `\\[server-ip]\IT-Management-Data`
3. **Should see the shared folder**
4. **Try creating a test file**
5. **Delete test file after testing**

---

### **Phase 5: User Account Configuration**

#### **Step 10: Configure User Accounts**
**Option A: Same User Account (Recommended)**
1. **Create same user account** on both PCs
2. **Use same username and password**
3. **Log in with same account** on both PCs

**Option B: Enable Guest Account**
1. **On Server PC:** Enable Guest account
2. **Set Guest permissions** for shared folder
3. **Use Guest account** for file sharing

#### **Step 11: Test User Authentication**
```cmd
# On Client PC, test authentication
net use \\[server-ip] /user:[username] [password]
```

---

### **Phase 6: Advanced Network Configuration**

#### **Step 12: Configure SMB Protocol**
**On Both PCs:**
1. **Open PowerShell as Administrator**
2. **Run:**
```powershell
Enable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol-Client
Enable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol-Server
```

#### **Step 13: Configure Network Adapter**
**On Both PCs:**
1. **Open Device Manager**
2. **Expand "Network adapters"**
3. **Right-click your network adapter**
4. **Properties** → **Advanced**
5. **Set "Large Send Offload" to "Disabled"**
6. **Set "Receive Side Scaling" to "Disabled"**

---

### **Phase 7: Router Configuration**

#### **Step 14: Check Router Settings**
1. **Access router admin panel** (usually 192.168.1.1)
2. **Check for "Client Isolation" or "AP Isolation"**
3. **DISABLE these features** if enabled
4. **Enable "UPnP"** if available
5. **Check firewall settings** on router

#### **Step 15: Port Forwarding (if needed)**
**On Router:**
1. **Port 445** (SMB) - Forward to server PC
2. **Port 139** (NetBIOS) - Forward to server PC
3. **Port 80** (HTTP) - Forward to server PC

---

### **Phase 8: Testing and Verification**

#### **Step 16: Comprehensive Connection Test**
```cmd
# On Client PC, run all tests:
ping [server-ip]
telnet [server-ip] 445
telnet [server-ip] 139
net view \\[server-ip]
dir \\[server-ip]\IT-Management-Data
```

#### **Step 17: Test IT Management Suite**
1. **Set Server PC** to Server mode
2. **Set Client PC** to Client mode
3. **Enter server details** on client
4. **Test connection** in the app
5. **Verify data sync** between PCs

---

### **Phase 9: Troubleshooting Common Issues**

#### **Issue: "Network path not found"**
**Solutions:**
1. **Check computer names** are correct
2. **Use IP address** instead of computer name
3. **Verify network discovery** is enabled
4. **Check firewall** settings

#### **Issue: "Access denied"**
**Solutions:**
1. **Check user permissions** on shared folder
2. **Verify user accounts** match
3. **Enable Guest account** if needed
4. **Check security settings**

#### **Issue: "Connection timeout"**
**Solutions:**
1. **Check network connectivity**
2. **Verify firewall** allows connections
3. **Test with different ports**
4. **Check router settings**

---

### **Phase 10: Alternative Solutions**

#### **If Network Fix Fails:**

**Option 1: Use Cloud Storage**
1. **Install OneDrive** on both PCs
2. **Create folder:** `OneDrive\IT-Management-Data`
3. **Set both PCs** to Cloud mode
4. **Database syncs** automatically

**Option 2: Use USB Drive**
1. **Copy database** to USB drive
2. **Use USB path** on both PCs
3. **Manual sync** when needed

**Option 3: Use VPN**
1. **Install VPN software** (TeamViewer, AnyDesk)
2. **Connect PCs** via VPN
3. **Use local database** paths
4. **Sync through VPN**

---

## 🎯 **Quick Success Checklist**

- [ ] Both PCs on same network
- [ ] Network Discovery enabled
- [ ] File sharing enabled
- [ ] Firewall configured
- [ ] Shared folder created
- [ ] User permissions set
- [ ] Connection test successful
- [ ] IT Management Suite working

---

## 📞 **Still Having Issues?**

If network troubleshooting doesn't work:
1. **Use Cloud Storage method** (OneDrive/Google Drive)
2. **Contact IT support** for network issues
3. **Consider upgrading** network infrastructure
4. **Use USB drive** for offline sync

The cloud storage method is the most reliable and requires no network configuration!



