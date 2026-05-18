import { app, Tray, Menu, nativeImage, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { Database } from '../database/database';
import { AuthService } from './authService';
import { ITAssetsService } from './itAssetsService';
import { TelecomAssetsService } from './telecomAssetsService';
import { AIImportService } from './aiImportService';
import { SystemMonitoringService } from './systemMonitoringService';

export class BackgroundService {
  private tray: Tray | null = null;
  private mainWindow: BrowserWindow | null = null;
  private database: Database;
  private authService: AuthService;
  private itAssetsService: ITAssetsService;
  private telecomAssetsService: TelecomAssetsService;
  private aiImportService: AIImportService;
  private systemMonitoringService: SystemMonitoringService;
  private isMinimizedToTray = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.database = new Database();
    this.authService = new AuthService();
    this.itAssetsService = new ITAssetsService(this.database);
    this.telecomAssetsService = new TelecomAssetsService(this.database);
    this.aiImportService = new AIImportService();
    this.systemMonitoringService = new SystemMonitoringService(this.database);
  }

  public async initialize(): Promise<void> {
    try {
      // Initialize database
      await this.database.initializeDatabase();
      console.log('Background service: Database initialized');

      // Create system tray
      this.createSystemTray();

      // Start background monitoring
      this.startBackgroundMonitoring();

      // Setup IPC handlers
      this.setupIpcHandlers();

      console.log('Background service: Initialized successfully');
    } catch (error) {
      console.error('Background service initialization failed:', error);
    }
  }

  private createSystemTray(): void {
    try {
      // Create tray icon
      const iconPath = path.join(__dirname, '../../assets/tray-icon.png');
      const icon = nativeImage.createFromPath(iconPath);
      
      // Fallback to a simple icon if file doesn't exist
      if (icon.isEmpty()) {
        const iconBuffer = Buffer.from(`
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="16" height="16" rx="2" fill="#3B82F6"/>
            <path d="M4 6L8 10L12 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `);
        const trayIcon = nativeImage.createFromBuffer(iconBuffer);
        this.tray = new Tray(trayIcon);
      } else {
        this.tray = new Tray(icon);
      }

      // Create context menu
      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Show IT Management Suite',
          click: () => this.showMainWindow()
        },
        {
          label: 'Dashboard',
          click: () => this.showMainWindow('/dashboard')
        },
        {
          label: 'IT Assets',
          click: () => this.showMainWindow('/it-assets')
        },
        {
          label: 'Telecom Assets',
          click: () => this.showMainWindow('/telecom-assets')
        },
        { type: 'separator' },
        {
          label: 'Settings',
          click: () => this.showMainWindow('/settings')
        },
        { type: 'separator' },
        {
          label: 'Quit',
          click: () => {
            this.cleanup();
            app.quit();
          }
        }
      ]);

      this.tray.setContextMenu(contextMenu);
      this.tray.setToolTip('IT Management Suite - Running in background');
      this.tray.on('double-click', () => this.showMainWindow());

      console.log('System tray created');
    } catch (error) {
      console.error('Failed to create system tray:', error);
    }
  }

  public showMainWindow(route?: string): void {
    if (this.mainWindow) {
      this.mainWindow.show();
      this.mainWindow.focus();
      if (route) {
        this.mainWindow.webContents.send('navigate-to', route);
      }
      return;
    }

    // Create main window
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      show: false,
      icon: path.join(__dirname, '../../assets/icon.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    // Load the React app
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../../build/index.html'));
    }

    // Handle window events
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      if (route) {
        this.mainWindow?.webContents.send('navigate-to', route);
      }
    });

    this.mainWindow.on('close', (event) => {
      if (!this.isMinimizedToTray) {
        event.preventDefault();
        this.mainWindow?.hide();
        this.isMinimizedToTray = true;
        this.tray?.setToolTip('IT Management Suite - Minimized to tray');
      }
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
      this.isMinimizedToTray = false;
    });
  }

  private startBackgroundMonitoring(): void {
    // Monitor system every 5 minutes
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.systemMonitoringService.collectSystemData();
        console.log('Background monitoring: System data collected');
      } catch (error) {
        console.error('Background monitoring error:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Initial monitoring
    this.systemMonitoringService.collectSystemData().catch(console.error);
  }

  private setupIpcHandlers(): void {
    // Auth handlers
    ipcMain.handle('auth:login', async (event, credentials) => {
      return await this.authService.login(credentials.email, credentials.password);
    });

    ipcMain.handle('auth:register', async (event, userData) => {
      return await this.authService.register(userData);
    });

    // IT Assets handlers
    ipcMain.handle('itAssets:getAll', async () => {
      return await this.itAssetsService.getAll();
    });

    ipcMain.handle('itAssets:create', async (event, assetData) => {
      return await this.itAssetsService.create(assetData);
    });

    ipcMain.handle('itAssets:update', async (event, id, assetData) => {
      return await this.itAssetsService.update(id, assetData);
    });

    ipcMain.handle('itAssets:delete', async (event, id) => {
      return await this.itAssetsService.delete(id);
    });

    ipcMain.handle('itAssets:import', async (event, filePath, format) => {
      return await this.itAssetsService.import(filePath, format);
    });

    ipcMain.handle('itAssets:export', async (event, format, filePath) => {
      return await this.itAssetsService.export(format, filePath);
    });

    // Telecom Assets handlers
    ipcMain.handle('telecomAssets:getAll', async () => {
      return await this.telecomAssetsService.getAll();
    });

    ipcMain.handle('telecomAssets:create', async (event, assetData) => {
      return await this.telecomAssetsService.create(assetData);
    });

    ipcMain.handle('telecomAssets:update', async (event, id, assetData) => {
      return await this.telecomAssetsService.update(id, assetData);
    });

    ipcMain.handle('telecomAssets:delete', async (event, id) => {
      return await this.telecomAssetsService.delete(id);
    });

    ipcMain.handle('telecomAssets:import', async (event, filePath, format) => {
      return await this.telecomAssetsService.import(filePath, format);
    });

    ipcMain.handle('telecomAssets:export', async (event, format, filePath) => {
      return await this.telecomAssetsService.export(format, filePath);
    });

    // AI Import handlers
    ipcMain.handle('aiImport:preview', async (event, data, type) => {
      return await this.aiImportService.previewImport(data, type);
    });

    ipcMain.handle('aiImport:execute', async (event, data, type) => {
      return await this.aiImportService.importExcelFile(data, type);
    });

    // System monitoring handlers
    ipcMain.handle('system:getData', async () => {
      return await this.systemMonitoringService.getSystemData();
    });

    // Window control handlers
    ipcMain.handle('window:minimize', () => {
      this.mainWindow?.minimize();
    });

    ipcMain.handle('window:maximize', () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });

    ipcMain.handle('window:close', () => {
      this.mainWindow?.close();
    });

    ipcMain.handle('window:hide', () => {
      this.mainWindow?.hide();
      this.isMinimizedToTray = true;
    });

    ipcMain.handle('window:show', () => {
      this.showMainWindow();
    });
  }

  public async cleanup(): Promise<void> {
    try {
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = null;
      }

      if (this.tray) {
        this.tray.destroy();
        this.tray = null;
      }

      if (this.mainWindow) {
        this.mainWindow.destroy();
        this.mainWindow = null;
      }

      await this.database.close();
      console.log('Background service: Cleanup completed');
    } catch (error) {
      console.error('Background service cleanup error:', error);
    }
  }

  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  public isRunning(): boolean {
    return this.tray !== null;
  }
}
