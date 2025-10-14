import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import { isDev } from './utils';
import { database } from './database/database';
import { systemInfoCollector } from './services/systemInfo';
import { AIAgent } from './services/aiAgent';
import { AuthService } from './services/authService';
import { ExcelExportService } from './services/excelExportService';
import { ExcelImportService } from './services/excelImportService';
import { DatabaseConfigService } from './services/databaseConfigService';

let mainWindow: BrowserWindow;
let currentDeviceId: number | null = null;
let aiAgent: AIAgent;
let authService: AuthService;
let excelExportService: ExcelExportService;

function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    titleBarStyle: 'default',
    show: false,
    title: 'IT Management Suite'
  });

  // Load the app
  if (isDev()) {
    const devUrl = 'http://localhost:3000';
    let retries = 0;
    const maxRetries = 5;
    let loaded = false;

    const tryLoad = () => {
      mainWindow.loadURL(devUrl).then(() => {
        loaded = true;
      }).catch(() => {});
    };

    mainWindow.webContents.on('did-finish-load', () => {
      loaded = true;
    });

    mainWindow.webContents.on('did-fail-load', () => {
      if (retries < maxRetries) {
        retries++;
        setTimeout(tryLoad, 1000 * retries);
      } else if (!loaded) {
        // Fallback to local build if dev server unavailable
        mainWindow.loadFile(path.join(__dirname, '../build/index.html')).catch(() => {});
      }
    });

    mainWindow.webContents.on('dom-ready', () => {
      if (!mainWindow.isVisible()) {
        mainWindow.show();
      }
    });

    tryLoad();
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null as any;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  try {
    // Initialize database first
    await database.initializeDatabase();
    console.log('Database initialized successfully');
    
    // Initialize services
    authService = new AuthService();
    aiAgent = new AIAgent();
    excelExportService = new ExcelExportService();
    
    
    // Register current device
    currentDeviceId = await systemInfoCollector.registerCurrentDevice();
    console.log(`Current device registered with ID: ${currentDeviceId}`);
    
    // Start system monitoring
    if (currentDeviceId) {
      await systemInfoCollector.startMonitoring(currentDeviceId);
    }
    
    createWindow();
    createMenu();
    setupIPC();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    dialog.showErrorBox('Initialization Error', 'Failed to initialize the IT Management Suite. Please restart the application.');
  }
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Create application menu
function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => {
            mainWindow.webContents.send('menu-new-project');
          }
        },
        {
          label: 'New Task',
          accelerator: 'CmdOrCtrl+Shift+T',
          click: () => {
            mainWindow.webContents.send('menu-new-task');
          }
        },
        {
          label: 'Add Device',
          accelerator: 'CmdOrCtrl+Shift+D',
          click: () => {
            mainWindow.webContents.send('menu-add-device');
          }
        },
        { type: 'separator' },
        {
          label: 'Export Data',
          click: () => {
            mainWindow.webContents.send('menu-export-data');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'System Information',
          click: () => {
            mainWindow.webContents.send('menu-system-info');
          }
        },
        {
          label: 'AI Assistant',
          click: () => {
            mainWindow.webContents.send('menu-ai-assistant');
          }
        },
        {
          label: 'Device Scan',
          click: () => {
            mainWindow.webContents.send('menu-device-scan');
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Setup IPC handlers
function setupIPC(): void {
  async function hasPermission(userId: number, permission: string): Promise<boolean> {
    try {
      const user = await database.getUserById(userId);
      if (!user) return false;
      if (user.role === 'admin') return true;
      const perms = await database.getUserPermissions(userId);
      return perms.includes(permission);
    } catch {
      return false;
    }
  }

  async function getCurrentUserId(): Promise<number | null> {
    try {
      const current = await authService.getCurrentUser();
      return current?.id ?? null;
    } catch {
      return null;
    }
  }
  // Basic app info
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  ipcMain.handle('get-platform', () => {
    return process.platform;
  });

  // Authentication
  ipcMain.handle('auth-login', async (event, credentials) => {
    try {
      console.log('Login attempt for email:', credentials.email);
      const result = await authService.login(credentials.email, credentials.password);
      console.log('Login result:', result);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An error occurred during login'
      };
    }
  });

  ipcMain.handle('auth-register', async (event, userData) => {
    try {
      console.log('Registration attempt for username:', userData.username);
      const result = await authService.register(userData);
      console.log('Registration result:', result);
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'An error occurred during registration'
      };
    }
  });

  ipcMain.handle('auth-logout', async () => {
    return await authService.logout();
  });

  ipcMain.handle('auth-get-current-user', () => {
    return authService.getCurrentUser();
  });

  // User management
  ipcMain.handle('users-get-all', async () => {
    return await database.getAllUsers();
  });

  ipcMain.handle('users-create', async (event, userData) => {
    const uid = await getCurrentUserId();
    if (!uid || !(await hasPermission(uid, 'create_users'))) return { success: false, message: 'Forbidden' } as any;
    return await database.createUser(userData);
  });

  ipcMain.handle('users-update', async (event, id, userData) => {
    const uid = await getCurrentUserId();
    if (!uid || !(await hasPermission(uid, 'edit_users'))) return { success: false, message: 'Forbidden' } as any;
    return await database.updateUser(id, userData);
  });

  ipcMain.handle('users-delete', async (event, id) => {
    const uid = await getCurrentUserId();
    if (!uid || !(await hasPermission(uid, 'delete_users'))) return { success: false, message: 'Forbidden' } as any;
    return await database.deleteUser(id);
  });

  // Device management
  ipcMain.handle('devices-get-all', async () => {
    return await database.getAllDevices();
  });

  ipcMain.handle('devices-get-by-id', async (event, id) => {
    return await database.getDeviceById(id);
  });

  ipcMain.handle('devices-create', async (event, deviceData) => {
    const uid = await getCurrentUserId();
    if (!uid || !(await hasPermission(uid, 'create_devices'))) return { success: false, message: 'Forbidden' } as any;
    return await database.createDevice(deviceData);
  });

  ipcMain.handle('devices-update', async (event, id, deviceData) => {
    const uid = await getCurrentUserId();
    if (!uid || !(await hasPermission(uid, 'edit_devices'))) return { success: false, message: 'Forbidden' } as any;
    return await database.updateDevice(id, deviceData);
  });

  ipcMain.handle('devices-delete', async (event, id) => {
    const uid = await getCurrentUserId();
    if (!uid || !(await hasPermission(uid, 'delete_devices'))) return { success: false, message: 'Forbidden' } as any;
    return await database.deleteDevice(id);
  });

  // System information
  ipcMain.handle('system-collect-info', async () => {
    return await systemInfoCollector.collectSystemInfo();
  });

  ipcMain.handle('system-register-device', async () => {
    return await systemInfoCollector.registerCurrentDevice();
  });

  ipcMain.handle('system-get-monitoring-data', async (event, deviceId, hours) => {
    return await database.getSystemMonitoringData(deviceId, hours);
  });

  // Project management
  ipcMain.handle('projects-get-all', async () => {
    return await database.getAllProjects();
  });

  ipcMain.handle('projects-get-by-user', async (event, userId) => {
    return await database.getProjectsByUserId(userId);
  });

  ipcMain.handle('projects-create', async (event, projectData) => {
    const uid = await getCurrentUserId();
    if (!uid || !(await hasPermission(uid, 'create_projects'))) return { success: false, message: 'Forbidden' } as any;
    return await database.createProject(projectData);
  });

  ipcMain.handle('projects-update', async (event, id, projectData) => {
    const uid = await getCurrentUserId();
    if (!uid || !(await hasPermission(uid, 'edit_projects'))) return { success: false, message: 'Forbidden' } as any;
    return await database.updateProject(id, projectData);
  });

  ipcMain.handle('projects-delete', async (event, id) => {
    const uid = await getCurrentUserId();
    if (!uid || !(await hasPermission(uid, 'delete_projects'))) return { success: false, message: 'Forbidden' } as any;
    return await database.deleteProject(id);
  });

// Excel Import IPC handlers
ipcMain.handle('excel-import-preview', async (event, fileData, assetType) => {
  try {
    console.log('Excel Import preview requested - data length:', fileData.length, 'type:', assetType);
    const result = await ExcelImportService.parseExcelFile(fileData, assetType);
    console.log('Excel Import preview result:', result);
    return result;
  } catch (error) {
    console.error('Excel Import preview error:', error);
    return {
      success: false,
      message: 'Preview failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
      columnMappings: [],
      sampleData: [],
      totalRows: 0,
      createdAssets: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
});

ipcMain.handle('excel-import-execute', async (event, fileData, assetType) => {
  try {
    console.log('Excel Import execute requested - data length:', fileData.length, 'type:', assetType);
    const result = await ExcelImportService.executeImport(fileData, assetType);
    console.log('Excel Import execute result:', result);
    return result;
  } catch (error) {
    console.error('Excel Import execute error:', error);
    return {
      success: false,
      message: 'Import failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
      createdAssets: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      columnMappings: [],
      sampleData: [],
      totalRows: 0
    };
  }
});

  ipcMain.handle('projects-export', async (event, format, theme) => {
    try {
      const buffer = await excelExportService.exportProjects(format, theme);
      
      // Show save dialog
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Projects',
        defaultPath: `projects-${new Date().toISOString().split('T')[0]}.${format}`,
        filters: [
          { name: 'Excel Files', extensions: ['xlsx'] },
          { name: 'CSV Files', extensions: ['csv'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (!result.canceled && result.filePath) {
        const fs = require('fs');
        fs.writeFileSync(result.filePath, buffer);
        return { success: true, filePath: result.filePath };
      }
      
      return { success: false, message: 'Export cancelled' };
    } catch (error) {
      console.error('Export error:', error);
      return { success: false, message: 'Export failed: ' + (error instanceof Error ? error.message : 'Unknown error') };
    }
  });

  // Task management
  ipcMain.handle('tasks-get-all', async () => {
    return await database.getAllTasks();
  });

  ipcMain.handle('tasks-get-by-user', async (event, userId) => {
    return await database.getTasksByUserId(userId);
  });

  ipcMain.handle('tasks-create', async (event, taskData) => {
    const uid = await getCurrentUserId();
    if (!uid || !(await hasPermission(uid, 'create_tasks'))) return { success: false, message: 'Forbidden' } as any;
    
    console.log('🔍 Backend: Creating task with data:', taskData);
    const result = await database.createTask(taskData);
    console.log('🔍 Backend: Task creation result:', result);
    
    
    return result;
  });

  ipcMain.handle('tasks-update', async (event, id, taskData) => {
    const uid = await getCurrentUserId();
    if (!uid || !(await hasPermission(uid, 'edit_tasks'))) return { success: false, message: 'Forbidden' } as any;
    return await database.updateTask(id, taskData);
  });

  ipcMain.handle('tasks-delete', async (event, id) => {
    const uid = await getCurrentUserId();
    if (!uid || !(await hasPermission(uid, 'delete_tasks'))) return { success: false, message: 'Forbidden' } as any;
    return await database.deleteTask(id);
  });

  ipcMain.handle('tasks-export', async (event, format, theme) => {
    try {
      const buffer = await excelExportService.exportTasks(format, theme);
      
      // Show save dialog
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Tasks',
        defaultPath: `tasks-${new Date().toISOString().split('T')[0]}.${format}`,
        filters: [
          { name: 'Excel Files', extensions: ['xlsx'] },
          { name: 'CSV Files', extensions: ['csv'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (!result.canceled && result.filePath) {
        const fs = require('fs');
        fs.writeFileSync(result.filePath, buffer);
        return { success: true, filePath: result.filePath };
      }
      
      return { success: false, message: 'Export cancelled' };
    } catch (error) {
      console.error('Export error:', error);
      return { success: false, message: 'Export failed: ' + (error instanceof Error ? error.message : 'Unknown error') };
    }
  });

  // AI Agent
  ipcMain.handle('ai-get-suggestions', async (event, context) => {
    return await aiAgent.getSuggestions(context);
  });

  ipcMain.handle('ai-analyze-system', async (event, systemData) => {
    return await aiAgent.analyzeSystem(systemData);
  });

  ipcMain.handle('ai-manage-tasks', async (event, tasks) => {
    return await aiAgent.manageTasks(tasks);
  });

  // Free-form AI query for chat UI
  ipcMain.handle('ai-process-query', async (event, query: string) => {
    try {
      // If OpenAI not initialized, provide a deterministic local reply
      if (!aiAgent.isAIAvailable()) {
        return `AI is offline. Your query: "${query}". Try again after setting OPENAI_API_KEY.`;
      }
      // Reuse suggestions endpoint by building minimal context
      const context = { userRole: 'admin', currentTasks: await database.getAllTasks(), devices: await database.getAllDevices(), projects: await database.getAllProjects(), systemHealth: { score: 85 } } as any;
      const prompt = `User question: ${query}\nRespond briefly and practically for an IT admin.`;
      // Call through agent suggestion model to keep one model configuration
      const openai: any = (aiAgent as any).openai;
      const resp = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a concise and practical IT admin assistant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 400,
        temperature: 0.3
      });
      return (resp.choices?.[0]?.message?.content ?? '').trim();
    } catch (e) {
      console.error('ai-process-query error:', e);
      return 'Sorry, I could not process that request.';
    }
  });

  // Audit logging
  ipcMain.handle('audit-log', async (event, auditData) => {
    return await database.addAuditLog(auditData);
  });

  // Permissions management
  ipcMain.handle('permissions-get-by-user', async (event, userId) => {
    return await database.getUserPermissions(userId);
  });

  ipcMain.handle('permissions-set', async (event, userId, permissionType, granted) => {
    await database.setUserPermission(userId, permissionType, granted);
    return { success: true };
  });

  ipcMain.handle('permissions-users-list', async () => {
    return await database.getAllUsersWithPermissions();
  });


  // IT Assets
  ipcMain.handle('it-assets-get-all', async () => {
    return await database.getAllITAssets();
  });

  ipcMain.handle('it-assets-get-by-id', async (event, id) => {
    return await database.getITAssetById(id);
  });

  ipcMain.handle('it-assets-create', async (event, assetData) => {
    const uid = await getCurrentUserId();
    if (!uid || !(await hasPermission(uid, 'create_it_assets'))) return { success: false, message: 'Forbidden' } as any;
    return await database.createITAsset(assetData);
  });

  ipcMain.handle('it-assets-update', async (event, id, assetData) => {
    const uid = await getCurrentUserId();
    if (!uid || !(await hasPermission(uid, 'edit_it_assets'))) return { success: false, message: 'Forbidden' } as any;
    return await database.updateITAsset(id, assetData);
  });

  ipcMain.handle('it-assets-delete', async (event, id) => {
    const uid = await getCurrentUserId();
    if (!uid || !(await hasPermission(uid, 'delete_it_assets'))) return { success: false, message: 'Forbidden' } as any;
    return await database.deleteITAsset(id);
  });

  ipcMain.handle('it-assets-export', async (event, format, theme) => {
    try {
      console.log('IT Assets export requested - format:', format, 'theme:', theme);
      console.log('ExcelExportService instance:', excelExportService);
      
      if (!excelExportService) {
        throw new Error('ExcelExportService not initialized');
      }
      
      console.log('Calling excelExportService.exportITAssets...');
      const buffer = await excelExportService.exportITAssets(format, theme);
      console.log('IT Assets export buffer created, size:', buffer.length);
      console.log('Buffer type:', typeof buffer);
      console.log('Buffer is Array:', Array.isArray(buffer));
      console.log('Buffer constructor:', buffer.constructor.name);
      
      // Show save dialog
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Export IT Assets',
        defaultPath: `it-assets-${new Date().toISOString().split('T')[0]}.${format}`,
        filters: [
          { name: 'Excel Files', extensions: ['xlsx'] },
          { name: 'CSV Files', extensions: ['csv'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      console.log('Save dialog result:', result);

      if (!result.canceled && result.filePath) {
        const fs = require('fs');
        fs.writeFileSync(result.filePath, buffer);
        console.log('File saved successfully to:', result.filePath);
        const response = { success: true, filePath: result.filePath };
        console.log('Returning response:', response);
        return response;
      }
      
      const response = { success: false, message: 'Export cancelled' };
      console.log('Returning response:', response);
      return response;
    } catch (error) {
      console.error('IT Assets export error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack',
        name: error instanceof Error ? error.name : 'Unknown'
      });
      const response = { success: false, message: 'Export failed: ' + (error instanceof Error ? error.message : 'Unknown error') };
      console.log('Returning error response:', response);
      return response;
    }
  });

  ipcMain.handle('it-assets-import', async (event, data, format) => {
    return await database.importITAssets(data, format);
  });

  // Telecom Assets
  ipcMain.handle('telecom-assets-get-all', async () => {
    return await database.getAllTelecomAssets();
  });

  ipcMain.handle('telecom-assets-get-by-id', async (event, id) => {
    return await database.getTelecomAssetById(id);
  });

  ipcMain.handle('telecom-assets-create', async (event, assetData) => {
    const uid = await getCurrentUserId();
    if (!uid || !(await hasPermission(uid, 'create_telecom_assets'))) return { success: false, message: 'Forbidden' } as any;
    return await database.createTelecomAsset(assetData);
  });

  ipcMain.handle('telecom-assets-update', async (event, id, assetData) => {
    const uid = await getCurrentUserId();
    if (!uid || !(await hasPermission(uid, 'edit_telecom_assets'))) return { success: false, message: 'Forbidden' } as any;
    return await database.updateTelecomAsset(id, assetData);
  });

  ipcMain.handle('telecom-assets-delete', async (event, id) => {
    const uid = await getCurrentUserId();
    if (!uid || !(await hasPermission(uid, 'delete_telecom_assets'))) return { success: false, message: 'Forbidden' } as any;
    return await database.deleteTelecomAsset(id);
  });

  ipcMain.handle('telecom-assets-export', async (event, format, theme) => {
    try {
      console.log('Telecom Assets export requested - format:', format, 'theme:', theme);
      console.log('ExcelExportService instance:', excelExportService);
      
      if (!excelExportService) {
        throw new Error('ExcelExportService not initialized');
      }
      
      const buffer = await excelExportService.exportTelecomAssets(format, theme);
      console.log('Telecom Assets export buffer created, size:', buffer.length);
      
      // Show save dialog
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Telecom Assets',
        defaultPath: `telecom-assets-${new Date().toISOString().split('T')[0]}.${format}`,
        filters: [
          { name: 'Excel Files', extensions: ['xlsx'] },
          { name: 'CSV Files', extensions: ['csv'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      console.log('Save dialog result:', result);

      if (!result.canceled && result.filePath) {
        const fs = require('fs');
        fs.writeFileSync(result.filePath, buffer);
        console.log('File saved successfully to:', result.filePath);
        return { success: true, filePath: result.filePath };
      }
      
      return { success: false, message: 'Export cancelled' };
    } catch (error) {
      console.error('Telecom Assets export error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack',
        name: error instanceof Error ? error.name : 'Unknown'
      });
      return { success: false, message: 'Export failed: ' + (error instanceof Error ? error.message : 'Unknown error') };
    }
  });

  ipcMain.handle('telecom-assets-import', async (event, data, format) => {
    return await database.importTelecomAssets(data, format);
  });

  // Installation Wizard IPC handlers
  ipcMain.handle('installation-get-config', async () => {
    try {
      const configService = database.getConfigService();
      return configService.getConfig();
    } catch (error) {
      console.error('Get installation config error:', error);
      throw error;
    }
  });

  ipcMain.handle('installation-set-mode', async (event, mode, serverInfo) => {
    try {
      const configService = database.getConfigService();
      // Persist selected mode and wait for config to be written
      await configService.setMode(mode, serverInfo);
      
      // Reinitialize database with new configuration
      const newDbPath = configService.getDatabasePath();
      database.setDatabasePath(newDbPath);
      
      // Initialize database for Server, Local, and Cloud modes on first run
      if (mode === 'server' || mode === 'local' || mode === 'cloud') {
        if (mode === 'server') {
          await configService.createSharedFolder();
        }
        await database.initializeDatabase();
      }
      
      return { success: true };
    } catch (error) {
      console.error('Set installation mode error:', error);
      throw error;
    }
  });

  ipcMain.handle('installation-discover-servers', async () => {
    try {
      const configService = database.getConfigService();
      return await configService.discoverServers();
    } catch (error) {
      console.error('Discover servers error:', error);
      throw error;
    }
  });

  ipcMain.handle('installation-test-server', async (event, serverInfo) => {
    try {
      const configService = database.getConfigService();
      return await configService.testServerConnection(serverInfo);
    } catch (error) {
      console.error('Test server connection error:', error);
      throw error;
    }
  });

  ipcMain.handle('installation-diagnose-connection', async (event, serverInfo) => {
    try {
      const configService = database.getConfigService();
      return await configService.diagnoseConnection(serverInfo);
    } catch (error) {
      console.error('Diagnose connection error:', error);
      throw error;
    }
  });

  ipcMain.handle('installation-get-server-info', async () => {
    try {
      const configService = database.getConfigService();
      return configService.getServerNetworkInfo();
    } catch (error) {
      console.error('Get server info error:', error);
      throw error;
    }
  });

  ipcMain.handle('installation-verify-server-mode', async () => {
    try {
      const configService = database.getConfigService();
      return await configService.verifyServerMode();
    } catch (error) {
      console.error('Verify server mode error:', error);
      return {
        isServerMode: false,
        sharedFolderExists: false,
        databaseExists: false,
        networkInfo: null,
        issues: ['Verification failed: ' + error]
      };
    }
  });

  // Database Path Management IPC handlers
  ipcMain.handle('installation-get-current-database-path', async () => {
    try {
      const configService = database.getConfigService();
      return configService.getDatabasePath();
    } catch (error) {
      console.error('Get current database path error:', error);
      throw error;
    }
  });

  ipcMain.handle('installation-set-database-path', async (event, newPath) => {
    try {
      const configService = database.getConfigService();
      await configService.setDatabasePath(newPath);
      
      // Update the database instance with new path
      database.setDatabasePath(newPath);
      
      return { success: true };
    } catch (error) {
      console.error('Set database path error:', error);
      throw error;
    }
  });

  ipcMain.handle('installation-get-local-database-path', async () => {
    try {
      const configService = database.getConfigService();
      return configService.getLocalDatabasePath();
    } catch (error) {
      console.error('Get local database path error:', error);
      throw error;
    }
  });

  ipcMain.handle('installation-get-onedrive-database-path', async () => {
    try {
      const configService = database.getConfigService();
      return configService.getOneDriveDatabasePath();
    } catch (error) {
      console.error('Get OneDrive database path error:', error);
      throw error;
    }
  });

  ipcMain.handle('installation-get-googledrive-database-path', async () => {
    try {
      const configService = database.getConfigService();
      return configService.getGoogleDriveDatabasePath();
    } catch (error) {
      console.error('Get Google Drive database path error:', error);
      throw error;
    }
  });

  ipcMain.handle('installation-get-network-database-paths', async () => {
    try {
      const configService = database.getConfigService();
      return configService.getNetworkDatabasePaths();
    } catch (error) {
      console.error('Get network database paths error:', error);
      throw error;
    }
  });

  ipcMain.handle('installation-test-database-connection', async (event, path) => {
    try {
      const configService = database.getConfigService();
      return await configService.testDatabaseConnection(path);
    } catch (error) {
      console.error('Test database connection error:', error);
      throw error;
    }
  });

  ipcMain.handle('installation-create-sync-folder', async (event, type) => {
    try {
      const configService = database.getConfigService();
      return await configService.createSyncFolder(type);
    } catch (error) {
      console.error('Create sync folder error:', error);
      throw error;
    }
  });

  ipcMain.handle('installation-get-potential-onedrive-database-path', async () => {
    try {
      const configService = database.getConfigService();
      return configService.getPotentialOneDriveDatabasePath();
    } catch (error) {
      console.error('Get potential OneDrive database path error:', error);
      throw error;
    }
  });

  ipcMain.handle('installation-get-potential-googledrive-database-path', async () => {
    try {
      const configService = database.getConfigService();
      return configService.getPotentialGoogleDriveDatabasePath();
    } catch (error) {
      console.error('Get potential Google Drive database path error:', error);
      throw error;
    }
  });

  ipcMain.handle('installation-get-connection-status', async () => {
    try {
      return database.getConnectionStatus();
    } catch (error) {
      console.error('Get connection status error:', error);
      throw error;
    }
  });

  ipcMain.handle('installation-check-connection', async () => {
    try {
      const isOnline = await database.checkConnection();
      const configService = database.getConfigService();
      configService.updateConnectionStatus(isOnline);
      return isOnline;
    } catch (error) {
      console.error('Check connection error:', error);
      throw error;
    }
  });

  // Auto-updater setup
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
    
    autoUpdater.on('update-available', () => {
      mainWindow.webContents.send('update-available');
    });

    autoUpdater.on('update-downloaded', () => {
      mainWindow.webContents.send('update-downloaded');
    });

    autoUpdater.on('error', (error) => {
      console.error('Auto-updater error:', error);
      mainWindow.webContents.send('update-error', error.message);
    });
  }

  // IPC handlers for update actions
  ipcMain.handle('check-for-updates', async () => {
    if (!isDev) {
      try {
        const result = await autoUpdater.checkForUpdates();
        return result;
      } catch (error) {
        console.error('Check for updates error:', error);
        throw error;
      }
    }
    return null;
  });

  ipcMain.handle('quit-and-install', () => {
    if (!isDev) {
      autoUpdater.quitAndInstall();
    }
  });
}
