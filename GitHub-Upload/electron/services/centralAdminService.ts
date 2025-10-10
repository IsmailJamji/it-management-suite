import { Database } from '../database/database';
import * as fs from 'fs';
import * as path from 'path';

export interface DeviceInfo {
  id: number;
  deviceName: string;
  os: string;
  architecture: string;
  lastSeen: string;
  status: 'online' | 'offline' | 'warning';
  ipAddress: string;
  macAddress: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkActivity: number;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  lastLogin: string;
  isActive: boolean;
  deviceCount: number;
}

export interface SystemAlert {
  id: number;
  deviceId: number;
  deviceName: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export class CentralAdminService {
  private database: Database;
  private alerts: SystemAlert[] = [];
  private deviceStatusInterval: NodeJS.Timeout | null = null;

  constructor(database: Database) {
    this.database = database;
  }

  public async initialize(): Promise<void> {
    try {
      // Start monitoring all devices
      this.startDeviceMonitoring();
      
      // Load existing alerts
      await this.loadAlerts();
      
      console.log('Central Admin Service: Initialized successfully');
    } catch (error) {
      console.error('Central Admin Service initialization failed:', error);
    }
  }

  private startDeviceMonitoring(): void {
    // Check device status every 2 minutes
    this.deviceStatusInterval = setInterval(async () => {
      try {
        await this.checkDeviceStatus();
        await this.generateAlerts();
      } catch (error) {
        console.error('Device monitoring error:', error);
      }
    }, 2 * 60 * 1000); // 2 minutes

    // Initial check
    this.checkDeviceStatus().catch(console.error);
  }

  private async checkDeviceStatus(): Promise<void> {
    try {
      const devices = await this.database.getAllDevices();
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      for (const device of devices) {
        const lastSeen = new Date(device.lastSeen || 0);
        
        if (lastSeen < fiveMinutesAgo) {
          // Device is offline
          await this.createAlert({
            deviceId: device.id,
            deviceName: device.deviceName || 'Unknown Device',
            type: 'warning',
            message: 'Device has been offline for more than 5 minutes',
            timestamp: now.toISOString(),
            resolved: false
          });
        }
      }
    } catch (error) {
      console.error('Error checking device status:', error);
    }
  }

  private async generateAlerts(): Promise<void> {
    try {
      // Check for high CPU usage
      const highCpuDevices: Array<{ id: number; deviceName?: string; cpuUsage?: number }> = [];
      for (const device of highCpuDevices) {
        await this.createAlert({
          deviceId: device.id,
          deviceName: device.deviceName || 'Unknown Device',
          type: 'warning',
          message: `High CPU usage detected: ${device.cpuUsage}%`,
          timestamp: new Date().toISOString(),
          resolved: false
        });
      }

      // Check for high memory usage
      const highMemoryDevices: Array<{ id: number; deviceName?: string; memoryUsage?: number }> = [];
      for (const device of highMemoryDevices) {
        await this.createAlert({
          deviceId: device.id,
          deviceName: device.deviceName || 'Unknown Device',
          type: 'warning',
          message: `High memory usage detected: ${device.memoryUsage}%`,
          timestamp: new Date().toISOString(),
          resolved: false
        });
      }

      // Check for low disk space
      const lowDiskDevices: Array<{ id: number; deviceName?: string; diskUsage?: number }> = [];
      for (const device of lowDiskDevices) {
        await this.createAlert({
          deviceId: device.id,
          deviceName: device.deviceName || 'Unknown Device',
          type: 'error',
          message: `Low disk space: ${device.diskUsage}% free`,
          timestamp: new Date().toISOString(),
          resolved: false
        });
      }
    } catch (error) {
      console.error('Error generating alerts:', error);
    }
  }

  private async createAlert(alert: Omit<SystemAlert, 'id'>): Promise<void> {
    try {
      // Check if similar alert already exists
      const existingAlert = this.alerts.find(a => 
        a.deviceId === alert.deviceId && 
        a.type === alert.type && 
        a.message === alert.message && 
        !a.resolved
      );

      if (!existingAlert) {
        const newAlert: SystemAlert = {
          ...alert,
          id: Date.now() // Simple ID generation
        };
        
        this.alerts.push(newAlert);
        await this.saveAlerts();
        
        console.log(`Alert created: ${alert.type.toUpperCase()} - ${alert.message}`);
      }
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  }

  private async loadAlerts(): Promise<void> {
    try {
      const alertsPath = path.join(process.cwd(), 'data', 'alerts.json');
      
      if (fs.existsSync(alertsPath)) {
        const data = fs.readFileSync(alertsPath, 'utf8');
        this.alerts = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
      this.alerts = [];
    }
  }

  private async saveAlerts(): Promise<void> {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const alertsPath = path.join(dataDir, 'alerts.json');
      fs.writeFileSync(alertsPath, JSON.stringify(this.alerts, null, 2));
    } catch (error) {
      console.error('Error saving alerts:', error);
    }
  }

  public async getAllDevices(): Promise<DeviceInfo[]> {
    try {
      const devices = await this.database.getAllDevices();
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      return devices.map(device => {
        const lastSeen = new Date(device.lastSeen || 0);
        const status = lastSeen > fiveMinutesAgo ? 'online' : 'offline';
        
        return {
          id: device.id,
          deviceName: device.deviceName || 'Unknown Device',
          os: device.os || 'Unknown OS',
          architecture: device.architecture || 'Unknown',
          lastSeen: device.lastSeen || 'Never',
          status: status as 'online' | 'offline' | 'warning',
          ipAddress: device.ipAddress || 'Unknown',
          macAddress: device.macAddress || 'Unknown',
          cpuUsage: device.cpuUsage || 0,
          memoryUsage: device.memoryUsage || 0,
          diskUsage: device.diskUsage || 0,
          networkActivity: device.networkActivity || 0
        };
      });
    } catch (error) {
      console.error('Error getting all devices:', error);
      return [];
    }
  }

  public async getAllUsers(): Promise<UserInfo[]> {
    try {
      const users = await this.database.getAllUsers();
      
      return users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role,
        department: user.department || '',
        lastLogin: user.lastLogin || 'Never',
        isActive: user.isActive === 1,
        deviceCount: 0 // TODO: Calculate actual device count
      }));
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  public async getAlerts(): Promise<SystemAlert[]> {
    return this.alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public async resolveAlert(alertId: number): Promise<void> {
    try {
      const alert = this.alerts.find(a => a.id === alertId);
      if (alert) {
        alert.resolved = true;
        await this.saveAlerts();
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  }

  public async getSystemStats(): Promise<{
    totalDevices: number;
    onlineDevices: number;
    offlineDevices: number;
    totalUsers: number;
    activeUsers: number;
    totalAlerts: number;
    unresolvedAlerts: number;
  }> {
    try {
      const devices = await this.getAllDevices();
      const users = await this.getAllUsers();
      const alerts = await this.getAlerts();
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const onlineDevices = devices.filter(d => d.status === 'online').length;
      const offlineDevices = devices.filter(d => d.status === 'offline').length;
      const activeUsers = users.filter(u => u.isActive).length;
      const unresolvedAlerts = alerts.filter(a => !a.resolved).length;

      return {
        totalDevices: devices.length,
        onlineDevices,
        offlineDevices,
        totalUsers: users.length,
        activeUsers,
        totalAlerts: alerts.length,
        unresolvedAlerts
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      return {
        totalDevices: 0,
        onlineDevices: 0,
        offlineDevices: 0,
        totalUsers: 0,
        activeUsers: 0,
        totalAlerts: 0,
        unresolvedAlerts: 0
      };
    }
  }

  public async cleanup(): Promise<void> {
    try {
      if (this.deviceStatusInterval) {
        clearInterval(this.deviceStatusInterval);
        this.deviceStatusInterval = null;
      }
      
      console.log('Central Admin Service: Cleanup completed');
    } catch (error) {
      console.error('Central Admin Service cleanup error:', error);
    }
  }
}
