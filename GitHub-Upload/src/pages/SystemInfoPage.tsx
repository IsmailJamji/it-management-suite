import React, { useState, useEffect } from 'react';
import { Cpu, Monitor, HardDrive, MemoryStick, Wifi, Shield, Download, Activity, Thermometer, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface SystemInfo {
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

const SystemInfoPage: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [monitoringData, setMonitoringData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemInfo();
    loadMonitoringData();
  }, []);

  const loadSystemInfo = async () => {
    try {
      setLoading(true);
      if (window.electronAPI) {
        const data = await window.electronAPI.system.collectInfo();
        setSystemInfo(data);
      } else {
        // Fallback mock data for development
        const mockData: SystemInfo = {
          os: {
            platform: 'win32',
            distro: 'Windows',
            release: '10',
            arch: 'x64',
            hostname: 'IT-CENTRAL-PC'
          },
          cpu: {
            manufacturer: 'Intel',
            brand: 'Core™ i7-10510U',
            cores: 8,
            physicalCores: 4,
            speed: '2.30 GHz'
          },
          memory: {
            total: 16,
            free: 8,
            used: 8,
            available: 12
          },
          disk: {
            total: 500,
            free: 300,
            used: 200
          },
          network: {
            interfaces: [
              {
                name: 'Ethernet',
                ip4: '192.168.1.100',
                mac: '00:1B:44:11:3A:B7'
              },
              {
                name: 'Wi-Fi',
                ip4: '192.168.1.101',
                mac: '00:1B:44:11:3A:B8'
              }
            ]
          },
          system: {
            manufacturer: 'Dell Inc.',
            model: 'Inspiron 15 3000',
            serial: 'ABC123456',
            uuid: '12345678-1234-1234-1234-123456789012'
          },
          graphics: {
            controllers: [
              {
                name: 'Intel UHD Graphics',
                vram: 0
              }
            ]
          },
          installedApps: [
            { name: 'Microsoft Office', version: '2021', installDate: '2024-01-15' },
            { name: 'Google Chrome', version: '120.0', installDate: '2024-01-20' },
            { name: 'Visual Studio Code', version: '1.85', installDate: '2024-01-25' },
            { name: 'Adobe Acrobat', version: '2023', installDate: '2024-02-01' },
            { name: 'Zoom', version: '5.17', installDate: '2024-02-05' },
            { name: 'Slack', version: '4.35', installDate: '2024-02-10' }
          ],
          antivirus: [
            { name: 'Windows Defender', running: true, enabled: true }
          ],
          updates: {
            available: 3,
            lastChecked: '2024-02-15T10:30:00Z'
          }
        };
        setSystemInfo(mockData);
      }
    } catch (error) {
      console.error('Failed to load system info:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMonitoringData = async () => {
    try {
      // This would load real monitoring data from the database
      // For now, we'll use sample data
      const sampleData = [
        { time: '00:00', cpu: 20, memory: 45, disk: 30 },
        { time: '04:00', cpu: 15, memory: 40, disk: 32 },
        { time: '08:00', cpu: 60, memory: 70, disk: 35 },
        { time: '12:00', cpu: 80, memory: 85, disk: 40 },
        { time: '16:00', cpu: 70, memory: 75, disk: 38 },
        { time: '20:00', cpu: 40, memory: 50, disk: 33 },
      ];
      setMonitoringData(sampleData);
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!systemInfo) {
    return (
      <div className="text-center py-12">
        <Cpu className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load system information</h3>
        <p className="text-muted-foreground mb-4">Please try refreshing the page.</p>
        <button onClick={loadSystemInfo} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  const memoryUsage = (systemInfo.memory.used / systemInfo.memory.total) * 100;
  const diskUsage = (systemInfo.disk.used / systemInfo.disk.total) * 100;

  const systemHealthData = [
    { name: 'Used', value: systemInfo.memory.used, color: '#3B82F6' },
    { name: 'Free', value: systemInfo.memory.free, color: '#10B981' },
  ];

  const diskHealthData = [
    { name: 'Used', value: systemInfo.disk.used, color: '#F59E0B' },
    { name: 'Free', value: systemInfo.disk.free, color: '#10B981' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Information</h1>
          <p className="text-muted-foreground">Monitor system performance and health</p>
        </div>
        <button onClick={loadSystemInfo} className="btn btn-outline">
          Refresh
        </button>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Monitor className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Operating System</p>
              <p className="text-lg font-semibold text-foreground">
                {systemInfo.os.distro} {systemInfo.os.release}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
              <Cpu className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Processor</p>
              <p className="text-lg font-semibold text-foreground">
                {systemInfo.cpu.brand}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <MemoryStick className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Memory</p>
              <p className="text-lg font-semibold text-foreground">
                {systemInfo.memory.total} GB
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <HardDrive className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Storage</p>
              <p className="text-lg font-semibold text-foreground">
                {systemInfo.disk.total} GB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU and Memory Usage */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Performance Metrics</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monitoringData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="cpu" stroke="#3B82F6" strokeWidth={2} name="CPU %" />
                <Line type="monotone" dataKey="memory" stroke="#10B981" strokeWidth={2} name="Memory %" />
                <Line type="monotone" dataKey="disk" stroke="#F59E0B" strokeWidth={2} name="Disk %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Memory Usage Pie Chart */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Memory Usage</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={systemHealthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {systemHealthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-muted-foreground">Used ({systemInfo.memory.used} GB)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">Free ({systemInfo.memory.free} GB)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Details */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">System Details</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Hostname:</span>
              <span className="font-medium">{systemInfo.os.hostname}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Architecture:</span>
              <span className="font-medium">{systemInfo.os.arch}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Manufacturer:</span>
              <span className="font-medium">{systemInfo.system.manufacturer}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Model:</span>
              <span className="font-medium">{systemInfo.system.model}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Serial Number:</span>
              <span className="font-medium font-mono text-sm">{systemInfo.system.serial}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">CPU Cores:</span>
              <span className="font-medium">{systemInfo.cpu.cores} ({systemInfo.cpu.physicalCores} physical)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">CPU Speed:</span>
              <span className="font-medium">{systemInfo.cpu.speed}</span>
            </div>
          </div>
        </div>

        {/* Network Information */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Network Information</h3>
          <div className="space-y-4">
            {systemInfo.network.interfaces.map((iface, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Wifi className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{iface.name}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">IP Address:</span>
                    <span className="font-mono">{iface.ip4}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">MAC Address:</span>
                    <span className="font-mono">{iface.mac}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security and Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Antivirus Status */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Security Status</h3>
          <div className="space-y-4">
            {systemInfo.antivirus.length > 0 ? (
              systemInfo.antivirus.map((av, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Shield className={`h-5 w-5 ${av.running ? 'text-green-500' : 'text-red-500'}`} />
                    <span className="font-medium">{av.name}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    av.running ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {av.running ? 'Running' : 'Stopped'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No antivirus software detected</p>
              </div>
            )}
          </div>
        </div>

        {/* Updates Status */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Updates Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Available Updates:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                systemInfo.updates.available > 0 
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              }`}>
                {systemInfo.updates.available} updates available
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Last Checked:</span>
              <span className="font-medium">
                {new Date(systemInfo.updates.lastChecked).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Installed Applications */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Installed Applications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemInfo.installedApps.slice(0, 12).map((app, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">
                  {app.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{app.name}</p>
                <p className="text-xs text-muted-foreground">Version {app.version}</p>
              </div>
            </div>
          ))}
        </div>
        {systemInfo.installedApps.length > 12 && (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            And {systemInfo.installedApps.length - 12} more applications...
          </p>
        )}
      </div>
    </div>
  );
};

export default SystemInfoPage;
