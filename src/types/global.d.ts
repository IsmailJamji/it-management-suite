// Global type definitions
import { ElectronAPI } from './electron';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};

