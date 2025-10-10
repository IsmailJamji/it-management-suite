import { Database } from '../database/database';
import * as si from 'systeminformation';

export class SystemMonitoringService {
  private database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  public async collectSystemData(): Promise<any> {
    try {
      const systemData = await this.getSystemInfo();
      const deviceId = await this.getCurrentDeviceId();
      
      if (deviceId) {
        await this.database.addSystemMonitoringData(deviceId, systemData);
        console.log('System monitoring data collected for device', deviceId);
      }
      
      return {
        success: true,
        data: systemData
      };
    } catch (error) {
      console.error('Error collecting system data:', error);
      return {
        success: false,
        message: 'Failed to collect system data'
      };
    }
  }

  public async getSystemData(): Promise<any> {
    try {
      const deviceId = await this.getCurrentDeviceId();
      if (!deviceId) {
        return {
          success: false,
          message: 'Device not registered'
        };
      }

      const data = await this.database.getSystemMonitoringData(deviceId, 24); // Last 24 hours
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error getting system data:', error);
      return {
        success: false,
        message: 'Failed to get system data'
      };
    }
  }

  private async getSystemInfo(): Promise<any> {
    try {
      const [
        cpu,
        memory,
        disk,
        network,
        osInfo,
        system
      ] = await Promise.all([
        si.cpu(),
        si.mem(),
        si.fsSize(),
        si.networkStats(),
        si.osInfo(),
        si.system()
      ]);

      return {
        timestamp: new Date().toISOString(),
        cpu: {
          manufacturer: cpu.manufacturer,
          brand: cpu.brand,
          cores: cpu.cores,
          physicalCores: cpu.physicalCores,
          speed: cpu.speed,
          usage: await si.currentLoad().then(data => data.currentLoad)
        },
        memory: {
          total: memory.total,
          free: memory.free,
          used: memory.used,
          available: memory.available,
          usage: (memory.used / memory.total) * 100
        },
        disk: disk.map(d => ({
          fs: d.fs,
          type: d.type,
          size: d.size,
          used: d.used,
          available: d.available,
          usage: (d.used / d.size) * 100
        })),
        network: network.map(n => ({
          iface: n.iface,
          operstate: n.operstate,
          rx_bytes: n.rx_bytes,
          tx_bytes: n.tx_bytes,
          rx_sec: n.rx_sec,
          tx_sec: n.tx_sec
        })),
        os: {
          platform: osInfo.platform,
          distro: osInfo.distro,
          release: osInfo.release,
          arch: osInfo.arch,
          hostname: osInfo.hostname
        },
        system: {
          manufacturer: system.manufacturer,
          model: system.model,
          version: system.version,
          serial: system.serial,
          uuid: system.uuid
        }
      };
    } catch (error) {
      console.error('Error getting system info:', error);
      return {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async getCurrentDeviceId(): Promise<number | null> {
    try {
      const devices = await this.database.getAllDevices();
      const currentDevice = devices.find(device => 
        device.isCurrentDevice === 1 || device.isCurrentDevice === true
      );
      return currentDevice ? currentDevice.id : null;
    } catch (error) {
      console.error('Error getting current device ID:', error);
      return null;
    }
  }
}
