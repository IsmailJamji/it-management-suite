import * as si from 'systeminformation';
import { exec } from 'child_process';
import { promisify } from 'util';
import { database } from '../database/database';
const execAsync = promisify(exec);

export interface SystemInfo {
  os: {
    platform: string;
    distro: string;
    release: string;
    arch: string;
    hostname: string;
  };
  cpu: {
    manufacturer: string;
    brand: string;
    cores: number;
    physicalCores: number;
    speed: string;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    available: number;
  };
  disk: {
    total: number;
    free: number;
    used: number;
  };
  network: {
    interfaces: Array<{
      name: string;
      ip4: string;
      mac: string;
    }>;
  };
  system: {
    manufacturer: string;
    model: string;
    serial: string;
    uuid: string;
  };
  graphics: {
    controllers: Array<{
      name: string;
      vram: number;
    }>;
  };
  installedApps: Array<{
    name: string;
    version: string;
    installDate: string;
  }>;
  antivirus: Array<{
    name: string;
    running: boolean;
    enabled: boolean;
  }>;
  updates: {
    available: number;
    lastChecked: string;
  };
}

export class SystemInfoCollector {
  private static instance: SystemInfoCollector;
  private isCollecting: boolean = false;

  public static getInstance(): SystemInfoCollector {
    if (!SystemInfoCollector.instance) {
      SystemInfoCollector.instance = new SystemInfoCollector();
    }
    return SystemInfoCollector.instance;
  }

  public async collectSystemInfo(): Promise<SystemInfo> {
    try {
      this.isCollecting = true;
      
      const [
        osInfo,
        cpuInfo,
        memInfo,
        diskInfo,
        networkInfo,
        systemInfo,
        graphicsInfo
      ] = await Promise.all([
        si.osInfo(),
        si.cpu(),
        si.mem(),
        si.fsSize(),
        si.networkInterfaces(),
        si.system(),
        si.graphics()
      ]);

      // Get installed applications (Windows specific) - optimized
      const installedApps = await this.getInstalledApplications();
      
      // Get antivirus information (Windows specific) - optimized
      const antivirus = await this.getAntivirusInfo();
      
      // Get update information
      const updates = await this.getUpdateInfo();

      const systemData: SystemInfo = {
        os: {
          platform: osInfo.platform,
          distro: osInfo.distro,
          release: osInfo.release,
          arch: osInfo.arch,
          hostname: osInfo.hostname
        },
        cpu: {
          manufacturer: cpuInfo.manufacturer,
          brand: cpuInfo.brand,
          cores: cpuInfo.cores,
          physicalCores: cpuInfo.physicalCores,
          speed: `${cpuInfo.speed} GHz`
        },
        memory: {
          total: Math.round(memInfo.total / 1024 / 1024 / 1024 * 100) / 100, // GB
          free: Math.round(memInfo.free / 1024 / 1024 / 1024 * 100) / 100, // GB
          used: Math.round((memInfo.total - memInfo.free) / 1024 / 1024 / 1024 * 100) / 100, // GB
          available: Math.round(memInfo.available / 1024 / 1024 / 1024 * 100) / 100 // GB
        },
        disk: {
          total: Math.round(diskInfo[0]?.size / 1024 / 1024 / 1024 * 100) / 100, // GB
          free: Math.round(diskInfo[0]?.available / 1024 / 1024 / 1024 * 100) / 100, // GB
          used: Math.round((diskInfo[0]?.size - diskInfo[0]?.available) / 1024 / 1024 / 1024 * 100) / 100 // GB
        },
        network: {
          interfaces: networkInfo
            .filter(iface => iface.operstate === 'up' && !!iface.ip4)
            .map(iface => ({
            name: iface.iface,
            ip4: iface.ip4 || 'N/A',
            mac: iface.mac || 'N/A'
          }))
        },
        system: {
          manufacturer: systemInfo.manufacturer,
          model: systemInfo.model,
          serial: systemInfo.serial,
          uuid: systemInfo.uuid
        },
        graphics: {
          controllers: graphicsInfo.controllers.map(gpu => ({
            name: gpu.model,
            vram: gpu.vram || 0
          }))
        },
        installedApps,
        antivirus,
        updates
      };

      this.isCollecting = false;
      return systemData;
    } catch (error) {
      this.isCollecting = false;
      console.error('Error collecting system information:', error);
      throw error;
    }
  }

  private async getInstalledApplications(): Promise<Array<{name: string, version: string, installDate: string}>> {
    try {
      if (process.platform !== 'win32') return [];

      const psCommand = `
$paths = @(
  'HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*',
  'HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*',
  'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*'
)
$apps = foreach ($p in $paths) {
  Get-ItemProperty -Path $p -ErrorAction SilentlyContinue |
    Where-Object { $_.DisplayName -and ($_.SystemComponent -ne 1) -and ($_.ReleaseType -ne 'Update') -and ($_.ParentKeyName -ne 'OperatingSystem') } |
    Select-Object @{n='name';e={$_.DisplayName}}, @{n='version';e={$_.DisplayVersion}}, @{n='installDate';e={ if ($_.InstallDate) { $_.InstallDate } else { '' } }}
} | Sort-Object name -Unique

# Fallback to Winget if registry empty
if (-not $apps -or $apps.Count -eq 0) {
  try {
    $winget = winget list --accept-source-agreements | Select-Object -Skip 1
    $parsed = @()
    foreach ($line in $winget) {
      $s = $line.ToString().Trim()
      if ($s) { $parts = -split $s; if ($parts.Length -ge 2) { $name = $parts[0]; $ver = $parts[-1]; $parsed += [PSCustomObject]@{ name=$name; version=$ver; installDate='' } } }
    }
    $apps = $parsed
  } catch {}
}

$apps | ConvertTo-Json -Compress
`

      const { stdout } = await execAsync(`powershell -NoProfile -ExecutionPolicy Bypass -Command ${JSON.stringify(psCommand)}`, { maxBuffer: 20 * 1024 * 1024 });
      const parsed = JSON.parse(stdout || '[]');
      const list = Array.isArray(parsed) ? parsed : [parsed];
      const sanitized = list
        .filter(a => a && typeof a.name === 'string' && a.name.trim().length > 0)
        .map(a => ({
          name: String(a.name).trim(),
          version: a.version ? String(a.version).trim() : '',
          installDate: a.installDate ? String(a.installDate).trim() : ''
        }))
        .filter(a => !/^KB\d+/i.test(a.name) && !/C\+\+ Redistributable/i.test(a.name));
      return sanitized;
    } catch (error) {
      console.error('Error getting installed applications:', error);
      return [];
    }
  }

  private async getAntivirusInfo(): Promise<Array<{name: string, running: boolean, enabled: boolean}>> {
    try {
      if (process.platform !== 'win32') return [];
      // Query Windows Security Center (SecurityCenter2) for installed AV
      const psCommand = `Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntivirusProduct | Select-Object displayName,productState | ConvertTo-Json -Compress`;
      const { stdout } = await execAsync(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${psCommand}"`);
      const parsed = JSON.parse(stdout || '[]');
      const list = Array.isArray(parsed) ? parsed : [parsed];
      return list.filter(Boolean).map((item: any) => {
        const state: number = Number(item.productState || 0);
        // Decode per Microsoft doc: high byte -> on/off, middle -> up-to-date, low -> signatures
        const onFlag = (state >> 16) & 0xFF;
        const enabled = onFlag === 0x10 || onFlag === 0x11;
        const running = onFlag !== 0x00;
        return { name: item.displayName || 'Unknown AV', running, enabled };
      });
    } catch (error) {
      // Fallback: try known services quick check
      try {
        const services = ['WinDefend','Kaspersky*','McAfee*','avast*','avg*','ekrn','MBAMService'];
        const ps = `Get-Service | Where-Object { $_.Name -like 'WinDefend' -or $_.Name -like 'Kaspersky*' -or $_.Name -like 'McAfee*' -or $_.Name -like 'avast*' -or $_.Name -like 'avg*' -or $_.Name -like 'ekrn' -or $_.Name -like 'MBAMService' } | Select-Object Name,Status | ConvertTo-Json -Compress`;
        const { stdout } = await execAsync(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${ps}"`);
        const parsed = JSON.parse(stdout || '[]');
        const list = Array.isArray(parsed) ? parsed : [parsed];
        return list.map((s: any) => ({ name: s.Name, running: s.Status === 'Running', enabled: s.Status === 'Running' }));
      } catch (e) {
        console.error('Antivirus detection fallback failed:', e);
        return [];
      }
    }
  }

  private async getUpdateInfo(): Promise<{available: number, lastChecked: string}> {
    try {
      // This is a simplified version - in a real implementation, you'd check Windows Update
      // or use platform-specific update checking methods
      return {
        available: 0,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting update information:', error);
      return {
        available: 0,
        lastChecked: new Date().toISOString()
      };
    }
  }

  public async registerCurrentDevice(): Promise<number> {
    try {
      const systemInfo = await this.collectSystemInfo();
      
      // Check if device already exists
      const existingDevice = await database.get(
        'SELECT id FROM devices WHERE serial_number = ? OR (mac_address = ? AND mac_address IS NOT NULL)',
        [systemInfo.system.serial, systemInfo.network.interfaces[0]?.mac]
      );

      if (existingDevice) {
        // Update existing device
        await database.updateDevice(existingDevice.id, {
          osName: systemInfo.os.distro,
          osVersion: systemInfo.os.release,
          ramGb: systemInfo.memory.total,
          processor: systemInfo.cpu.brand,
          diskSpaceGb: systemInfo.disk.total,
          diskUsedGb: systemInfo.disk.used,
          lastSeen: new Date().toISOString(),
          ipAddress: systemInfo.network.interfaces[0]?.ip4,
          macAddress: systemInfo.network.interfaces[0]?.mac,
          hostname: systemInfo.os.hostname,
          manufacturer: systemInfo.system.manufacturer,
          model: systemInfo.system.model,
          serialNumber: systemInfo.system.serial,
          installedApps: JSON.stringify(systemInfo.installedApps),
          systemInfo: JSON.stringify(systemInfo),
          updateStatus: systemInfo.updates.available > 0 ? 'Updates Available' : 'Up to Date',
          antivirusStatus: systemInfo.antivirus.length > 0 ? 
            systemInfo.antivirus.filter(av => av.running).map(av => av.name).join(', ') : 
            'No Antivirus Detected'
        });

        // Backfill IT Asset with richer details if it exists
        try {
          const existingAsset = await database.get(
            'SELECT id FROM it_assets WHERE serial_number = ?',
            [systemInfo.system.serial]
          );
          if (existingAsset?.id) {
            await database.updateITAsset(existingAsset.id, {
              ramGb: Math.round(systemInfo.memory.total),
              diskGb: Math.round(systemInfo.disk.total),
              processor: systemInfo.cpu.brand,
              os: `${systemInfo.os.distro} ${systemInfo.os.release}`,
              peripheralType: null,
              connectionType: null,
              status: 'active'
            });
          }
        } catch (_) {}
        return existingDevice.id;
      } else {
        // Create new device
        const deviceId = await database.createDevice({
          name: `${systemInfo.os.hostname} (${systemInfo.system.model})`,
          deviceTypeId: 1, // Assuming 1 is laptop/desktop
          serialNumber: systemInfo.system.serial,
          model: systemInfo.system.model,
          manufacturer: systemInfo.system.manufacturer,
          hostname: systemInfo.os.hostname,
          status: 'active',
          location: 'Office',
          osName: systemInfo.os.distro,
          osVersion: systemInfo.os.release,
          ramGb: systemInfo.memory.total,
          processor: systemInfo.cpu.brand,
          diskSpaceGb: systemInfo.disk.total,
          ipAddress: systemInfo.network.interfaces[0]?.ip4,
          macAddress: systemInfo.network.interfaces[0]?.mac,
          installedApps: JSON.stringify(systemInfo.installedApps),
          systemInfo: JSON.stringify(systemInfo),
          updateStatus: systemInfo.updates.available > 0 ? 'Updates Available' : 'Up to Date',
          antivirusStatus: systemInfo.antivirus.length > 0 ? 
            systemInfo.antivirus.filter(av => av.running).map(av => av.name).join(', ') : 
            'No Antivirus Detected'
        });

        // Also create an IT Asset entry for the detected device
        await this.createITAssetFromDevice(systemInfo, deviceId);
        
        return deviceId;
      }
    } catch (error) {
      console.error('Error registering current device:', error);
      throw error;
    }
  }

  private async createITAssetFromDevice(systemInfo: SystemInfo, deviceId: number): Promise<void> {
    try {
      // Get the current logged-in user (if any)
      const currentUser = await this.getCurrentUser();
      
      // Determine device type based on system info
      let deviceType = 'desktop';
      if (systemInfo.system.model && systemInfo.system.model.toLowerCase().includes('laptop')) {
        deviceType = 'laptop';
      } else if (systemInfo.system.model && systemInfo.system.model.toLowerCase().includes('notebook')) {
        deviceType = 'laptop';
      }

      // Create IT Asset entry
      const itAssetData = {
        device_type: deviceType,
        device_name: systemInfo.os.hostname || systemInfo.system.model || '',
        owner_name: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System User',
        department: currentUser ? currentUser.department : 'IT',
        zone: 'Office',
        serial_number: systemInfo.system.serial || `AUTO-${Date.now()}`,
        ticket_number: `AUTO-${deviceId}`,
        model: systemInfo.system.model || 'Unknown',
        brand: systemInfo.system.manufacturer || 'Unknown',
        date: new Date().toISOString().split('T')[0],
        status: 'active',
        // Computer-specific fields
        ram_gb: Math.round(systemInfo.memory.total),
        disk_gb: Math.round(systemInfo.disk.total),
        processor: systemInfo.cpu.brand,
        os: `${systemInfo.os.distro} ${systemInfo.os.release}`,
        // Extended fields
        ip_address: systemInfo.network.interfaces[0]?.ip4 || '',
        mac_address: systemInfo.network.interfaces[0]?.mac || '',
        hostname: systemInfo.os.hostname || '',
        location: 'Office'
      };

      await database.createITAsset(itAssetData);
      console.log(`IT Asset created for device ${deviceId} (${systemInfo.os.hostname})`);
    } catch (error) {
      console.error('Error creating IT Asset from device:', error);
      // Don't throw error here as device registration should still succeed
    }
  }

  private async getCurrentUser(): Promise<any> {
    try {
      // Import auth service dynamically to avoid circular dependencies
      const { AuthService } = await import('./authService');
      const authService = new AuthService();
      return authService.getCurrentUser();
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  public async startMonitoring(deviceId: number, intervalMs: number = 60000): Promise<void> {
    setInterval(async () => {
      try {
        const systemInfo = await this.collectSystemInfo();
        
        // Calculate usage percentages
        const cpuUsage = await si.currentLoad();
        const memoryUsage = (systemInfo.memory.used / systemInfo.memory.total) * 100;
        const diskUsage = (systemInfo.disk.used / systemInfo.disk.total) * 100;
        
        // Get network stats
        const networkStats = await si.networkStats();
        const networkIn = networkStats[0]?.rx_sec || 0;
        const networkOut = networkStats[0]?.tx_sec || 0;
        
        // Get temperature
        const temperature = await si.cpuTemperature().catch(() => ({ main: 0 }));
        
        // Get uptime
        const uptime = await si.time();
        
        await database.addSystemMonitoringData(deviceId, {
          cpu_usage: cpuUsage.currentLoad,
          memory_usage: memoryUsage,
          disk_usage: diskUsage,
          network_usage: networkIn + networkOut,
          temperature: temperature.main,
          uptime_seconds: uptime.uptime
        });
        
        console.log(`System monitoring data collected for device ${deviceId}`);
      } catch (error) {
        console.error('Error collecting monitoring data:', error);
      }
    }, intervalMs);
  }

  public isCurrentlyCollecting(): boolean {
    return this.isCollecting;
  }
}

export const systemInfoCollector = SystemInfoCollector.getInstance();
