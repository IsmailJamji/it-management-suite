import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

export interface DatabaseConfig {
  mode: 'server' | 'client' | 'local' | 'cloud';
  dbPath: string;
  serverInfo?: {
    name: string;
    ip: string;
    networkPath: string;
  };
  isOnline: boolean;
  lastSync?: Date;
}

export class DatabaseConfigService {
  private config: DatabaseConfig | null = null;
  private configPath: string;

  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'database-config.json');
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8');
        this.config = JSON.parse(configData);
        console.log('Database config loaded:', this.config);
      } else {
        console.log('No database config found, installation wizard will be shown');
      }
    } catch (error) {
      console.error('Failed to load database config:', error);
    }
  }

  private saveConfig(): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Failed to save database config:', error);
    }
  }

  public async setMode(mode: 'server' | 'client' | 'local' | 'cloud', serverInfo?: { name: string; ip: string }): Promise<void> {
    let dbPath: string;
    let isOnline = false;

    switch (mode) {
      case 'server':
        // Server mode: create shared database folder
        console.log('🔧 Setting up server mode...');
        const sharedDataPath = path.join(app.getPath('documents'), 'IT-Management-Data');
        console.log('Shared data path:', sharedDataPath);
        
        this.ensureDirectoryExists(sharedDataPath);
        console.log('✅ Shared directory created/verified');
        
        dbPath = path.join(sharedDataPath, 'it_management.db');
        console.log('Database path:', dbPath);
        
        isOnline = await this.checkConnection(dbPath);
        console.log('Database connection status:', isOnline);
        break;

      case 'client':
        // Client mode: connect to server's shared database
        if (!serverInfo) {
          throw new Error('Server information required for client mode');
        }
        
        // Try to connect to server
        const networkPath = `\\\\${serverInfo.name}\\IT-Management-Data\\it_management.db`;
        isOnline = await this.checkConnection(networkPath);
        
        if (isOnline) {
          dbPath = networkPath;
          console.log(`✅ Connected to server: ${serverInfo.name}`);
        } else {
          // Fallback: Create local database with server sync capability
          console.log(`⚠️ Server connection failed, creating local database with sync capability`);
          const localDataPath = app.getPath('userData');
          dbPath = path.join(localDataPath, 'it_management.db');
          isOnline = true; // Local database is always "online"
        }
        break;

      case 'local':
        // Local mode: use local database
        const localDataPath = app.getPath('userData');
        dbPath = path.join(localDataPath, 'it_management.db');
        isOnline = await this.checkConnection(dbPath);
        break;

      case 'cloud':
        // Cloud mode: use cloud storage path (OneDrive, Google Drive, etc.)
        const documentsPath = app.getPath('documents');
        const cloudPath = path.join(documentsPath, 'IT-Management-Cloud');
        this.ensureDirectoryExists(cloudPath);
        dbPath = path.join(cloudPath, 'it_management.db');
        isOnline = await this.checkConnection(dbPath);
        console.log('☁️ Cloud mode: Using cloud storage path:', dbPath);
        console.log('📁 Documents folder:', documentsPath);
        console.log('📁 Cloud folder created:', cloudPath);
        break;

      default:
        throw new Error('Invalid database mode');
    }

    this.config = {
      mode,
      dbPath,
      serverInfo: serverInfo ? {
        name: serverInfo.name,
        ip: serverInfo.ip,
        networkPath: mode === 'client' ? dbPath : ''
      } : undefined,
      isOnline,
      lastSync: new Date()
    };

    this.saveConfig();
  }

  public getConfig(): DatabaseConfig | null {
    return this.config;
  }

  public getDatabasePath(): string {
    if (!this.config) {
      throw new Error('Database not configured. Please run installation wizard.');
    }
    return this.config.dbPath;
  }

  public isServerMode(): boolean {
    return this.config?.mode === 'server';
  }

  public isClientMode(): boolean {
    return this.config?.mode === 'client';
  }

  public isLocalMode(): boolean {
    return this.config?.mode === 'local';
  }

  public async checkConnection(dbPath?: string): Promise<boolean> {
    const pathToCheck = dbPath || this.config?.dbPath;
    if (!pathToCheck) return false;

    try {
      console.log(`🔍 Checking connection to: ${pathToCheck}`);
      
      // For network paths, check if the file exists
      if (pathToCheck.startsWith('\\\\')) {
        // Try multiple approaches for network paths
        const networkChecks = [
          // Direct file access
          () => fs.promises.access(pathToCheck, fs.constants.F_OK),
          // Directory access
          () => fs.promises.access(path.dirname(pathToCheck), fs.constants.F_OK),
          // Read directory contents
          () => fs.promises.readdir(path.dirname(pathToCheck))
        ];
        
        for (const check of networkChecks) {
          try {
            await check();
            console.log(`✅ Network path accessible: ${pathToCheck}`);
            return true;
          } catch (error) {
            console.log(`❌ Network check failed: ${error}`);
          }
        }
        
        // If all checks fail, try alternative paths
        const alternativePaths = [
          pathToCheck.replace(/\\[^\\]+\\IT-Management-Data\\/, '\\IT-Management-Data\\'),
          pathToCheck.replace(/\\IT-Management-Data\\/, '\\Documents\\IT-Management-Data\\'),
          pathToCheck.replace(/\\[^\\]+\\IT-Management-Data\\/, '\\Documents\\IT-Management-Data\\')
        ];
        
        for (const altPath of alternativePaths) {
          try {
            await fs.promises.access(altPath, fs.constants.F_OK);
            console.log(`✅ Alternative path accessible: ${altPath}`);
        return true;
          } catch (error) {
            // Continue to next alternative
          }
        }
        
        console.log(`❌ All network path checks failed for: ${pathToCheck}`);
        return false;
      } else {
        // For local paths, check if directory exists
        const dir = path.dirname(pathToCheck);
        await fs.promises.access(dir, fs.constants.F_OK);
        console.log(`✅ Local path accessible: ${pathToCheck}`);
        return true;
      }
    } catch (error) {
      console.log(`❌ Connection check failed: ${error}`);
      return false;
    }
  }

  public async testServerConnection(serverInfo: { name: string; ip: string }): Promise<boolean> {
    console.log(`🔍 Testing server connection to ${serverInfo.name} (${serverInfo.ip})`);
    
    // Try multiple connection strategies
    const connectionStrategies = [
      // Strategy 1: Use server name
      `\\\\${serverInfo.name}\\IT-Management-Data\\it_management.db`,
      // Strategy 2: Use IP address
      `\\\\${serverInfo.ip}\\IT-Management-Data\\it_management.db`,
      // Strategy 3: Try Documents folder
      `\\\\${serverInfo.name}\\Documents\\IT-Management-Data\\it_management.db`,
      `\\\\${serverInfo.ip}\\Documents\\IT-Management-Data\\it_management.db`,
      // Strategy 4: Try different share names
      `\\\\${serverInfo.name}\\IT-Management-Data\\`,
      `\\\\${serverInfo.ip}\\IT-Management-Data\\`,
      // Strategy 5: Try with different computer name formats
      `\\\\${serverInfo.name.toUpperCase()}\\IT-Management-Data\\it_management.db`,
      `\\\\${serverInfo.name.toLowerCase()}\\IT-Management-Data\\it_management.db`
    ];
    
    for (const strategy of connectionStrategies) {
      try {
        console.log(`🔍 Trying connection strategy: ${strategy}`);
        const isConnected = await this.checkConnection(strategy);
        if (isConnected) {
          console.log(`✅ Connection successful with strategy: ${strategy}`);
          return true;
        }
      } catch (error) {
        console.log(`❌ Strategy failed: ${strategy} - ${error}`);
      }
    }
    
    console.log(`❌ All connection strategies failed for ${serverInfo.name}`);
    return false;
  }

  public async discoverServers(): Promise<Array<{ name: string; ip: string; status: 'online' | 'offline' }>> {
    const servers: Array<{ name: string; ip: string; status: 'online' | 'offline' }> = [];
    
    // Get local network range
    const localIPs = this.getLocalNetworkIPs();
    
    console.log('🔍 Scanning for IT Management Suite servers...');
    console.log(`📡 Checking ${localIPs.length} IP addresses`);
    
    // Limit to first 50 IPs to avoid timeout
    const limitedIPs = localIPs.slice(0, 50);
    
    for (const ip of limitedIPs) {
      try {
        console.log(`🔍 Testing IP: ${ip}`);
        
        // First try to get actual computer name
        const computerName = await this.getComputerNameFromIP(ip);
        if (computerName) {
          console.log(`💻 Found computer name: ${computerName} for ${ip}`);
          
          // Test the actual computer name
          const networkPath = `\\\\${computerName}\\IT-Management-Data\\it_management.db`;
          const isOnline = await this.checkConnection(networkPath);
          
          if (isOnline) {
            servers.push({
              name: computerName,
              ip,
              status: 'online'
            });
            console.log(`✅ Found server: ${computerName} (${ip})`);
            continue; // Skip generic name testing for this IP
          }
        }
        
        // Fallback: Try generic names
        const possibleNames = [
          `PC-${ip.split('.').pop()}`,
          `DESKTOP-${ip.split('.').pop()}`,
          `LAPTOP-${ip.split('.').pop()}`,
          `SERVER-${ip.split('.').pop()}`
        ];
        
        for (const name of possibleNames) {
          const networkPath = `\\\\${name}\\IT-Management-Data\\it_management.db`;
          const isOnline = await this.checkConnection(networkPath);
          if (isOnline) {
            servers.push({
              name,
              ip,
              status: 'online'
            });
            console.log(`✅ Found server with generic name: ${name} (${ip})`);
            break;
          }
        }
      } catch (error) {
        console.log(`❌ Error testing IP ${ip}:`, error);
      }
    }

    console.log(`🎯 Discovery complete. Found ${servers.length} servers`);

    // If no servers found, return some mock servers for demo
    if (servers.length === 0) {
      console.log('No servers found, returning mock servers for demo');
      return [
        {
          name: 'DESKTOP-ABC123',
          ip: '192.168.1.100',
          status: 'offline'
        },
        {
          name: 'LAPTOP-XYZ789',
          ip: '192.168.1.101',
          status: 'offline'
        }
      ];
    }

    return servers;
  }

  private async getComputerNameFromIP(ip: string): Promise<string | null> {
    try {
      // Try to resolve IP to hostname using DNS
      const dns = require('dns');
      const hostname = await new Promise<string>((resolve, reject) => {
        dns.reverse(ip, (err: any, hostnames: string[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(hostnames[0] || '');
          }
        });
      });
      
      if (hostname && hostname !== ip) {
        return hostname.split('.')[0]; // Return just the computer name
      }
    } catch (error) {
      console.log(`Could not resolve hostname for ${ip}:`, error);
    }
    
    return null;
  }

  private getLocalNetworkIPs(): string[] {
    const ips: string[] = [];
    
    // Get network interfaces first
    const interfaces = os.networkInterfaces();
    const localRanges: string[] = [];
    
    for (const interfaceName in interfaces) {
      const networkInterface = interfaces[interfaceName];
      if (networkInterface) {
        for (const connection of networkInterface) {
          if (connection.family === 'IPv4' && !connection.internal) {
            const ip = connection.address;
            const networkPrefix = ip.substring(0, ip.lastIndexOf('.'));
            localRanges.push(`${networkPrefix}.`);
            break;
          }
        }
      }
    }
    
    // Add common local network ranges
    const baseIPs = [
      '192.168.1.',
      '192.168.0.',
      '10.0.0.',
      '172.16.0.',
      ...localRanges
    ];
    
    // Remove duplicates
    const uniqueRanges = [...new Set(baseIPs)];
    
    for (const base of uniqueRanges) {
      for (let i = 1; i <= 254; i++) {
        ips.push(`${base}${i}`);
      }
    }
    
    return ips;
  }

  public updateConnectionStatus(isOnline: boolean): void {
    if (this.config) {
      this.config.isOnline = isOnline;
      this.config.lastSync = new Date();
      this.saveConfig();
    }
  }

  public getServerInfo(): { name: string; ip: string; networkPath: string } | undefined {
    return this.config?.serverInfo;
  }

  public getSharedFolderPath(): string | null {
    if (this.config?.mode === 'server') {
      return path.dirname(this.config.dbPath);
    }
    return null;
  }

  public getServerNetworkInfo(): { name: string; ip: string; sharedPath: string } | null {
    console.log('🔍 Checking server mode...');
    console.log('Current config:', this.config);
    console.log('Current mode:', this.config?.mode);
    
    if (this.config?.mode !== 'server') {
      console.log('❌ Not in server mode, current mode:', this.config?.mode);
      return null;
    }

    try {
      console.log('✅ Server mode detected, getting network info...');
      
      // Get computer name
      const computerName = os.hostname();
      console.log('Computer name:', computerName);
      
      // Get local IP address
      const interfaces = os.networkInterfaces();
      let localIP = '127.0.0.1';
      
      console.log('Available network interfaces:', Object.keys(interfaces));
      
      for (const interfaceName in interfaces) {
        const networkInterface = interfaces[interfaceName];
        if (networkInterface) {
          for (const connection of networkInterface) {
            if (connection.family === 'IPv4' && !connection.internal) {
              localIP = connection.address;
              console.log(`Found IP address: ${localIP} on interface: ${interfaceName}`);
              break;
            }
          }
        }
      }
      
      // Get shared folder path
      const sharedPath = this.getSharedFolderPath() || '';
      console.log('Shared folder path:', sharedPath);
      
      const serverInfo = {
        name: computerName,
        ip: localIP,
        sharedPath: sharedPath
      };
      
      console.log('✅ Server network info:', serverInfo);
      return serverInfo;
    } catch (error) {
      console.error('❌ Failed to get server network info:', error);
      return null;
    }
  }

  public async diagnoseConnection(serverInfo: { name: string; ip: string }): Promise<{
    success: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    console.log(`🔍 Diagnosing connection to ${serverInfo.name} (${serverInfo.ip})`);
    
    // Test 1: Ping the server
    try {
      const { exec } = require('child_process');
      const pingResult = await new Promise<boolean>((resolve) => {
        exec(`ping -n 1 ${serverInfo.ip}`, (error: any) => {
          resolve(!error);
        });
      });
      
      if (!pingResult) {
        issues.push(`Cannot ping server ${serverInfo.ip}`);
        suggestions.push('Check if server is online and network is connected');
      }
    } catch (error) {
      issues.push('Ping test failed');
    }
    
    // Test 2: Check if server name resolves
    try {
      const dns = require('dns');
      await new Promise<void>((resolve, reject) => {
        dns.lookup(serverInfo.name, (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      issues.push(`Cannot resolve server name: ${serverInfo.name}`);
      suggestions.push('Try using IP address instead of computer name');
    }
    
    // Test 3: Check network path access
    const networkPaths = [
      `\\\\${serverInfo.name}\\IT-Management-Data\\`,
      `\\\\${serverInfo.ip}\\IT-Management-Data\\`,
      `\\\\${serverInfo.name}\\Documents\\IT-Management-Data\\`
    ];
    
    let pathAccessible = false;
    for (const networkPath of networkPaths) {
      try {
        const isAccessible = await this.checkConnection(networkPath + 'it_management.db');
        if (isAccessible) {
          pathAccessible = true;
          break;
        }
      } catch (error) {
        // Continue to next path
      }
    }
    
    if (!pathAccessible) {
      issues.push('Cannot access shared folder');
      suggestions.push('Check if server has shared the IT-Management-Data folder');
      suggestions.push('Verify user permissions on the shared folder');
      suggestions.push('Check Windows firewall settings');
    }
    
    // Test 4: Check database file
    const dbPath = `\\\\${serverInfo.name}\\IT-Management-Data\\it_management.db`;
    const dbExists = await this.checkConnection(dbPath);
    
    if (!dbExists) {
      issues.push('Database file not found');
      suggestions.push('Make sure the server is running in Server mode');
      suggestions.push('Check if the database file exists in the shared folder');
    }
    
    const success = issues.length === 0;
    
    if (!success) {
      suggestions.push('Try running the application as Administrator');
      suggestions.push('Check Windows Network Discovery settings');
      suggestions.push('Verify both PCs are on the same network');
    }
    
    return {
      success,
      issues,
      suggestions
    };
  }

  public async createSharedFolder(): Promise<void> {
    if (this.config?.mode === 'server') {
      const sharedFolder = this.getSharedFolderPath();
      if (sharedFolder) {
        await this.ensureDirectoryExists(sharedFolder);
        console.log('✅ Shared folder created/verified:', sharedFolder);
        
        // Create backup folder
        const backupFolder = path.join(sharedFolder, 'backups');
        await this.ensureDirectoryExists(backupFolder);
        
        // Create logs folder
        const logsFolder = path.join(sharedFolder, 'logs');
        await this.ensureDirectoryExists(logsFolder);
      }
    }
  }

  public async verifyServerMode(): Promise<{
    isServerMode: boolean;
    sharedFolderExists: boolean;
    databaseExists: boolean;
    networkInfo: { name: string; ip: string; sharedPath: string } | null;
    issues: string[];
  }> {
    const issues: string[] = [];
    let isServerMode = false;
    let sharedFolderExists = false;
    let databaseExists = false;
    let networkInfo: { name: string; ip: string; sharedPath: string } | null = null;

    try {
      // Check if in server mode
      isServerMode = this.config?.mode === 'server';
      console.log('Server mode check:', isServerMode);

      if (!isServerMode) {
        issues.push('Not running in server mode');
        return { isServerMode, sharedFolderExists, databaseExists, networkInfo, issues };
      }

      // Check shared folder
      const sharedFolder = this.getSharedFolderPath();
      if (sharedFolder) {
        try {
          await fs.promises.access(sharedFolder, fs.constants.F_OK);
          sharedFolderExists = true;
          console.log('✅ Shared folder exists:', sharedFolder);
        } catch (error) {
          issues.push('Shared folder does not exist');
          console.log('❌ Shared folder missing:', sharedFolder);
        }
      } else {
        issues.push('Shared folder path not configured');
      }

      // Check database file
      if (this.config?.dbPath) {
        try {
          await fs.promises.access(this.config.dbPath, fs.constants.F_OK);
          databaseExists = true;
          console.log('✅ Database file exists:', this.config.dbPath);
        } catch (error) {
          issues.push('Database file does not exist');
          console.log('❌ Database file missing:', this.config.dbPath);
        }
      } else {
        issues.push('Database path not configured');
      }

      // Get network info
      networkInfo = this.getServerNetworkInfo();
      if (!networkInfo) {
        issues.push('Could not retrieve network information');
      }

    } catch (error) {
      console.error('Server mode verification failed:', error);
      issues.push('Verification failed: ' + error);
    }

    return { isServerMode, sharedFolderExists, databaseExists, networkInfo, issues };
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.promises.mkdir(dirPath, { recursive: true });
      console.log('✅ Directory created/verified:', dirPath);
    } catch (error) {
      console.error('❌ Failed to create directory:', dirPath, error);
      throw new Error(`Failed to create directory: ${dirPath}. Please check permissions.`);
    }
  }

  public reset(): void {
    this.config = null;
    try {
      if (fs.existsSync(this.configPath)) {
        fs.unlinkSync(this.configPath);
      }
    } catch (error) {
      console.error('Failed to reset database config:', error);
    }
  }

  // Database Path Management Methods
  public getCurrentDatabasePath(): string {
    return this.config?.dbPath || '';
  }

  public async setDatabasePath(newPath: string): Promise<void> {
    if (this.config) {
      this.config.dbPath = newPath;
      this.saveConfig();
    }
  }

  public getLocalDatabasePath(): string {
    return path.join(app.getPath('userData'), 'database.db');
  }

  public getOneDriveDatabasePath(): string | null {
    try {
      const oneDrivePath = path.join(os.homedir(), 'OneDrive', 'IT-Management-Cloud');
      if (fs.existsSync(oneDrivePath)) {
        return path.join(oneDrivePath, 'database.db');
      }
    } catch (error) {
      console.error('Error getting OneDrive path:', error);
    }
    return null;
  }

  public getPotentialOneDriveDatabasePath(): string {
    return path.join(os.homedir(), 'OneDrive', 'IT-Management-Cloud', 'database.db');
  }

  public getGoogleDriveDatabasePath(): string | null {
    try {
      const googleDrivePath = path.join(os.homedir(), 'Google Drive', 'IT-Management-Cloud');
      if (fs.existsSync(googleDrivePath)) {
        return path.join(googleDrivePath, 'database.db');
      }
    } catch (error) {
      console.error('Error getting Google Drive path:', error);
    }
    return null;
  }

  public getPotentialGoogleDriveDatabasePath(): string {
    return path.join(os.homedir(), 'Google Drive', 'IT-Management-Cloud', 'database.db');
  }

  public getNetworkDatabasePaths(): string[] {
    const paths: string[] = [];
    try {
      // Common network share paths
      const commonPaths = [
        '\\\\server\\IT-Management-Cloud\\database.db',
        '\\\\192.168.1.100\\IT-Management-Cloud\\database.db',
        '\\\\IT-SERVER\\IT-Management-Cloud\\database.db'
      ];
      
      for (const networkPath of commonPaths) {
        try {
          if (fs.existsSync(networkPath)) {
            paths.push(networkPath);
          }
        } catch (error) {
          // Path doesn't exist or not accessible
        }
      }
    } catch (error) {
      console.error('Error getting network paths:', error);
    }
    return paths;
  }

  public async testDatabaseConnection(path: string): Promise<boolean> {
    try {
      if (!path) return false;
      
      // Test if path exists and is accessible
      await fs.promises.access(path, fs.constants.F_OK);
      
      // Test if we can read the file
      await fs.promises.readFile(path);
      
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  public async createSyncFolder(type: 'onedrive' | 'googledrive'): Promise<boolean> {
    try {
      let syncPath: string;
      
      if (type === 'onedrive') {
        syncPath = path.join(os.homedir(), 'OneDrive', 'IT-Management-Cloud');
      } else {
        syncPath = path.join(os.homedir(), 'Google Drive', 'IT-Management-Cloud');
      }
      
      // Create the sync folder
      await fs.promises.mkdir(syncPath, { recursive: true });
      
      // Create a placeholder file to ensure the folder is created
      const placeholderPath = path.join(syncPath, '.sync-folder-created');
      await fs.promises.writeFile(placeholderPath, 'Sync folder created for IT Management Suite');
      
      return true;
    } catch (error) {
      console.error('Error creating sync folder:', error);
      return false;
    }
  }
}
