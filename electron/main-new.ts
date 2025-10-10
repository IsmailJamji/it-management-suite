import { app, BrowserWindow, Menu, dialog } from 'electron';
import * as path from 'path';
import { BackgroundService } from './services/backgroundService';

let backgroundService: BackgroundService;

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  try {
    // Initialize background service
    backgroundService = new BackgroundService();
    await backgroundService.initialize();
    
    console.log('IT Management Suite started successfully');
    
    // Show main window immediately
    backgroundService.showMainWindow();
    
    // Handle app activation (macOS)
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        backgroundService.showMainWindow();
      }
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    dialog.showErrorBox(
      'Initialization Error', 
      'Failed to initialize the IT Management Suite. Please restart the application.'
    );
  }
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle app closing
app.on('before-quit', async () => {
  if (backgroundService) {
    await backgroundService.cleanup();
  }
});

// Handle second instance (prevent multiple instances)
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, focus our window instead
    if (backgroundService) {
      backgroundService.showMainWindow();
    }
  });
}

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    console.log('Blocked new window to:', url);
    return { action: 'deny' };
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  dialog.showErrorBox('Application Error', 'An unexpected error occurred. The application will restart.');
  app.relaunch();
  app.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  dialog.showErrorBox('Application Error', 'An unexpected error occurred. The application will restart.');
  app.relaunch();
  app.exit(1);
});
