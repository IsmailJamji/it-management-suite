import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Auth API
  auth: {
    login: (credentials: { email: string; password: string }) => 
      ipcRenderer.invoke('auth-login', credentials),
    register: (userData: any) => 
      ipcRenderer.invoke('auth-register', userData),
    logout: () => ipcRenderer.invoke('auth-logout'),
    getCurrentUser: () => ipcRenderer.invoke('auth-get-current-user')
  },

  // IT Assets API
  itAssets: {
    getAll: () => ipcRenderer.invoke('it-assets-get-all'),
    getById: (id: number) => ipcRenderer.invoke('it-assets-get-by-id', id),
    create: (assetData: any) => ipcRenderer.invoke('it-assets-create', assetData),
    update: (id: number, assetData: any) => ipcRenderer.invoke('it-assets-update', id, assetData),
    delete: (id: number) => ipcRenderer.invoke('it-assets-delete', id),
    import: (data: any, format: string) => ipcRenderer.invoke('it-assets-import', data, format),
    export: (format: string, theme: string) => ipcRenderer.invoke('it-assets-export', format, theme)
  },

  // Telecom Assets API
  telecomAssets: {
    getAll: () => ipcRenderer.invoke('telecom-assets-get-all'),
    getById: (id: number) => ipcRenderer.invoke('telecom-assets-get-by-id', id),
    create: (assetData: any) => ipcRenderer.invoke('telecom-assets-create', assetData),
    update: (id: number, assetData: any) => ipcRenderer.invoke('telecom-assets-update', id, assetData),
    delete: (id: number) => ipcRenderer.invoke('telecom-assets-delete', id),
    import: (data: any, format: string) => ipcRenderer.invoke('telecom-assets-import', data, format),
    export: (format: string, theme: string) => ipcRenderer.invoke('telecom-assets-export', format, theme)
  },

  // Devices API
  devices: {
    getAll: () => ipcRenderer.invoke('devices-get-all'),
    getById: (id: number) => ipcRenderer.invoke('devices-get-by-id', id),
    create: (deviceData: any) => ipcRenderer.invoke('devices-create', deviceData),
    update: (id: number, deviceData: any) => ipcRenderer.invoke('devices-update', id, deviceData),
    delete: (id: number) => ipcRenderer.invoke('devices-delete', id)
  },

  // Users API
  users: {
    getAll: () => ipcRenderer.invoke('users-get-all'),
    create: (userData: any) => ipcRenderer.invoke('users-create', userData),
    update: (id: number, userData: any) => ipcRenderer.invoke('users-update', id, userData),
    delete: (id: number) => ipcRenderer.invoke('users-delete', id)
  },

  // Projects API
  projects: {
    getAll: () => ipcRenderer.invoke('projects-get-all'),
    getByUser: (userId: number) => ipcRenderer.invoke('projects-get-by-user', userId),
    create: (projectData: any) => ipcRenderer.invoke('projects-create', projectData),
    update: (id: number, projectData: any) => ipcRenderer.invoke('projects-update', id, projectData),
    delete: (id: number) => ipcRenderer.invoke('projects-delete', id),
    export: (format: string, theme: string) => ipcRenderer.invoke('projects-export', format, theme)
  },

  // Tasks API
  tasks: {
    getAll: () => ipcRenderer.invoke('tasks-get-all'),
    getByUser: (userId: number) => ipcRenderer.invoke('tasks-get-by-user', userId),
    create: (taskData: any) => ipcRenderer.invoke('tasks-create', taskData),
    update: (id: number, taskData: any) => ipcRenderer.invoke('tasks-update', id, taskData),
    delete: (id: number) => ipcRenderer.invoke('tasks-delete', id),
    export: (format: string, theme: string) => ipcRenderer.invoke('tasks-export', format, theme)
  },

  // Permissions API
  permissions: {
    getByUser: (userId: number) => ipcRenderer.invoke('permissions-get-by-user', userId),
    set: (userId: number, permissionType: string, granted: boolean) => ipcRenderer.invoke('permissions-set', userId, permissionType, granted),
    listUsers: () => ipcRenderer.invoke('permissions-users-list')
  },


  // Excel Import API
  excelImport: {
    preview: (fileData: string, type: string) => ipcRenderer.invoke('excel-import-preview', fileData, type),
    execute: (fileData: string, type: string) => ipcRenderer.invoke('excel-import-execute', fileData, type)
  },

  // AI API
  ai: {
    getSuggestions: (context: any) => ipcRenderer.invoke('ai-get-suggestions', context),
    processQuery: (query: string) => ipcRenderer.invoke('ai-process-query', query)
  },

  // System Monitoring API
  system: {
    collectInfo: () => ipcRenderer.invoke('system-collect-info'),
    registerDevice: () => ipcRenderer.invoke('system-register-device'),
    getMonitoringData: (deviceId: number, hours?: number) => ipcRenderer.invoke('system-get-monitoring-data', deviceId, hours)
  },

  // Installation Wizard API
  installation: {
    getConfig: () => ipcRenderer.invoke('installation-get-config'),
    setMode: (mode: 'server' | 'client' | 'local' | 'cloud', serverInfo?: { name: string; ip: string }) => 
      ipcRenderer.invoke('installation-set-mode', mode, serverInfo),
    discoverServers: () => ipcRenderer.invoke('installation-discover-servers'),
    testServer: (serverInfo: { name: string; ip: string }) => 
      ipcRenderer.invoke('installation-test-server', serverInfo),
    diagnoseConnection: (serverInfo: { name: string; ip: string }) => 
      ipcRenderer.invoke('installation-diagnose-connection', serverInfo),
    getServerInfo: () => ipcRenderer.invoke('installation-get-server-info'),
    verifyServerMode: () => ipcRenderer.invoke('installation-verify-server-mode'),
    getConnectionStatus: () => ipcRenderer.invoke('installation-get-connection-status'),
    checkConnection: () => ipcRenderer.invoke('installation-check-connection'),
    // Database Path Management
    getCurrentDatabasePath: () => ipcRenderer.invoke('installation-get-current-database-path'),
    setDatabasePath: (newPath: string) => ipcRenderer.invoke('installation-set-database-path', newPath),
    getLocalDatabasePath: () => ipcRenderer.invoke('installation-get-local-database-path'),
    getOneDriveDatabasePath: () => ipcRenderer.invoke('installation-get-onedrive-database-path'),
    getGoogleDriveDatabasePath: () => ipcRenderer.invoke('installation-get-googledrive-database-path'),
    getNetworkDatabasePaths: () => ipcRenderer.invoke('installation-get-network-database-paths'),
    testDatabaseConnection: (path: string) => ipcRenderer.invoke('installation-test-database-connection', path),
    createSyncFolder: (type: 'onedrive' | 'googledrive') => ipcRenderer.invoke('installation-create-sync-folder', type),
    getPotentialOneDriveDatabasePath: () => ipcRenderer.invoke('installation-get-potential-onedrive-database-path'),
    getPotentialGoogleDriveDatabasePath: () => ipcRenderer.invoke('installation-get-potential-googledrive-database-path')
  },

  // Window Control API
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    hide: () => ipcRenderer.invoke('window:hide'),
    show: () => ipcRenderer.invoke('window:show')
  },

  // Navigation API
  navigateTo: (callback: (route: string) => void) => {
    ipcRenderer.on('navigate-to', (event, route) => callback(route));
  },

  // Menu events: bridge individual menu channels into a single callback
  onMenuEvent: (callback: (event: string) => void) => {
    const channels = [
      'menu-new-project',
      'menu-new-task',
      'menu-add-device',
      'menu-export-data',
      'menu-system-info',
      'menu-ai-assistant',
      'menu-device-scan'
    ];
    channels.forEach((ch) => {
      ipcRenderer.on(ch, () => callback(ch));
    });
  },

  // Auto-updater API
  updater: {
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
    onUpdateAvailable: (callback: () => void) => {
      ipcRenderer.on('update-available', callback);
    },
    onUpdateDownloaded: (callback: () => void) => {
      ipcRenderer.on('update-downloaded', callback);
    },
    onUpdateError: (callback: (error: string) => void) => {
      ipcRenderer.on('update-error', (event, error) => callback(error));
    }
  },

  // Remove all menu listeners
  removeAllListeners: () => {
    const channels = [
      'menu-new-project',
      'menu-new-task',
      'menu-add-device',
      'menu-export-data',
      'menu-system-info',
      'menu-ai-assistant',
      'menu-device-scan',
      'navigate-to',
      'update-available',
      'update-downloaded',
      'update-error'
    ];
    channels.forEach((ch) => ipcRenderer.removeAllListeners(ch));
  }
});

// Enhanced Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      auth: {
        login: (credentials: { email: string; password: string }) => Promise<any>;
        register: (userData: any) => Promise<any>;
        logout: () => Promise<void>;
        getCurrentUser: () => Promise<any>;
      };
      itAssets: {
        getAll: () => Promise<any[]>;
        getById: (id: number) => Promise<any>;
        create: (assetData: any) => Promise<number>;
        update: (id: number, assetData: any) => Promise<void>;
        delete: (id: number) => Promise<void>;
        import: (data: any, format: string) => Promise<any>;
        export: (format: string, theme: string) => Promise<any>;
      };
      telecomAssets: {
        getAll: () => Promise<any[]>;
        getById: (id: number) => Promise<any>;
        create: (assetData: any) => Promise<number>;
        update: (id: number, assetData: any) => Promise<void>;
        delete: (id: number) => Promise<void>;
        import: (data: any, format: string) => Promise<any>;
        export: (format: string, theme: string) => Promise<any>;
      };
      devices: {
        getAll: () => Promise<any[]>;
        getById: (id: number) => Promise<any>;
        create: (deviceData: any) => Promise<number>;
        update: (id: number, deviceData: any) => Promise<void>;
        delete: (id: number) => Promise<void>;
      };
      users: {
        getAll: () => Promise<any[]>;
        create: (userData: any) => Promise<number>;
        update: (id: number, userData: any) => Promise<void>;
        delete: (id: number) => Promise<void>;
      };
      projects: {
        getAll: () => Promise<any[]>;
        getByUser: (userId: number) => Promise<any[]>;
        create: (projectData: any) => Promise<number>;
        update: (id: number, projectData: any) => Promise<void>;
        delete: (id: number) => Promise<void>;
        export: (format: string, theme: string) => Promise<any>;
      };
      tasks: {
        getAll: () => Promise<any[]>;
        getByUser: (userId: number) => Promise<any[]>;
        create: (taskData: any) => Promise<number>;
        update: (id: number, taskData: any) => Promise<void>;
        delete: (id: number) => Promise<void>;
        export: (format: string, theme: string) => Promise<any>;
      };
      permissions: {
        getByUser: (userId: number) => Promise<string[]>;
        set: (userId: number, permissionType: string, granted: boolean) => Promise<any>;
        listUsers: () => Promise<any[]>;
      };
      system: {
        collectInfo: () => Promise<any>;
        registerDevice: () => Promise<any>;
        getMonitoringData: (deviceId: number, hours?: number) => Promise<any>;
      };
      installation: {
        getConfig: () => Promise<any>;
        setMode: (mode: 'server' | 'client' | 'local' | 'cloud', serverInfo?: { name: string; ip: string }) => Promise<any>;
        discoverServers: () => Promise<any[]>;
        testServer: (serverInfo: { name: string; ip: string }) => Promise<boolean>;
        diagnoseConnection: (serverInfo: { name: string; ip: string }) => Promise<{ success: boolean; issues: string[]; suggestions: string[] }>;
        getServerInfo: () => Promise<{ name: string; ip: string; sharedPath: string } | null>;
        verifyServerMode: () => Promise<{
          isServerMode: boolean;
          sharedFolderExists: boolean;
          databaseExists: boolean;
          networkInfo: { name: string; ip: string; sharedPath: string } | null;
          issues: string[];
        }>;
        getConnectionStatus: () => Promise<any>;
        checkConnection: () => Promise<boolean>;
      };
      window: {
        minimize: () => Promise<void>;
        maximize: () => Promise<void>;
        close: () => Promise<void>;
        hide: () => Promise<void>;
        show: () => Promise<void>;
      };
      navigateTo: (callback: (route: string) => void) => void;
      onMenuEvent: (callback: (event: string) => void) => void;
      removeAllListeners: () => void;
      
      // Auto-updater API
      updater: {
        checkForUpdates: () => Promise<any>;
        quitAndInstall: () => Promise<void>;
        onUpdateAvailable: (callback: () => void) => void;
        onUpdateDownloaded: (callback: () => void) => void;
        onUpdateError: (callback: (error: string) => void) => void;
      };
    };
  }
}