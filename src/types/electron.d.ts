// Electron API Type Definitions
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
        export: (format: string, theme: string, language?: string) => Promise<any>;
      };
      telecomAssets: {
        getAll: () => Promise<any[]>;
        getById: (id: number) => Promise<any>;
        create: (assetData: any) => Promise<number>;
        update: (id: number, assetData: any) => Promise<void>;
        delete: (id: number) => Promise<void>;
        import: (data: any, format: string) => Promise<any>;
        export: (format: string, theme: string, language?: string) => Promise<any>;
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
        export: (format: string, theme: string, language?: string) => Promise<any>;
      };
      tasks: {
        getAll: () => Promise<any[]>;
        getByUser: (userId: number) => Promise<any[]>;
        create: (taskData: any) => Promise<number>;
        update: (id: number, taskData: any) => Promise<void>;
        delete: (id: number) => Promise<void>;
        export: (format: string, theme: string, language?: string) => Promise<any>;
      };
      permissions: {
        getByUser: (userId: number) => Promise<string[]>;
        set: (userId: number, permissionType: string, granted: boolean) => Promise<any>;
        listUsers: () => Promise<any[]>;
      };
  excelImport: {
    preview: (fileData: string, type: string) => Promise<any>;
    execute: (fileData: string, type: string) => Promise<any>;
  };
      ai: {
        getSuggestions: (context: any) => Promise<any>;
        processQuery: (query: string) => Promise<any>;
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
        // Database Path Management
        getCurrentDatabasePath: () => Promise<string>;
        setDatabasePath: (newPath: string) => Promise<{ success: boolean }>;
        getLocalDatabasePath: () => Promise<string>;
        getOneDriveDatabasePath: () => Promise<string | null>;
        getGoogleDriveDatabasePath: () => Promise<string | null>;
        getNetworkDatabasePaths: () => Promise<string[]>;
        testDatabaseConnection: (path: string) => Promise<boolean>;
        createSyncFolder: (type: 'onedrive' | 'googledrive') => Promise<boolean>;
        getPotentialOneDriveDatabasePath: () => Promise<string>;
        getPotentialGoogleDriveDatabasePath: () => Promise<string>;
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
    };
  }
}

export {};