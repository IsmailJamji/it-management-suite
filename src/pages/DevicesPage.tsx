import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import ModernButton from '../components/ModernButton';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface Device {
  id: number;
  name: string;
  device_type_name: string;
  status: string;
  assigned_user_name: string;
  location: string;
  os_name: string;
  os_version: string;
  ram_gb: number;
  processor: string;
  disk_space_gb: number;
  disk_used_gb: number;
  last_seen: string;
  ip_address: string;
  mac_address: string;
  antivirus_status: string;
  update_status: string;
  manufacturer?: string;
  model?: string;
  hostname?: string;
  serial_number?: string;
}

const DevicesPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const { t } = useLanguage();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [deviceTypes, setDeviceTypes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadDevices();
    loadDeviceTypes();
    loadUsers();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const data = await window.electronAPI.devices.getAll();
      setDevices(data);
    } catch (error) {
      console.error('Failed to load devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDeviceTypes = async () => {
    try {
      // This would need to be implemented in the backend
      const types = [
        { id: 1, name: 'laptop', description: 'Portable computer device' },
        { id: 2, name: 'desktop', description: 'Desktop computer' },
        { id: 3, name: 'printer', description: 'Printing device' },
        { id: 4, name: 'phone', description: 'Mobile phone' },
        { id: 5, name: 'tablet', description: 'Tablet device' },
        { id: 6, name: 'server', description: 'Server machine' },
        { id: 7, name: 'network_device', description: 'Router, switch, or other network equipment' },
        { id: 8, name: 'monitor', description: 'Display monitor' },
        { id: 9, name: 'keyboard', description: 'Input keyboard' },
        { id: 10, name: 'mouse', description: 'Input mouse' }
      ];
      setDeviceTypes(types);
    } catch (error) {
      console.error('Failed to load device types:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await window.electronAPI.users.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleViewDevice = (device: Device) => {
    setSelectedDevice(device);
    setShowViewModal(true);
  };

  const handleEditDevice = (device: Device) => {
    setSelectedDevice(device);
    setShowEditModal(true);
  };

  const handleDeleteDevice = async (deviceId: number) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await window.electronAPI.devices.delete(deviceId);
        await loadDevices(); // Refresh the device list
        console.log('Device deleted successfully:', deviceId);
      } catch (error) {
        console.error('Failed to delete device:', error);
        alert('Failed to delete device. Please try again.');
      }
    }
  };

  const handleUpdateDevice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDevice) return;
    
    try {
      const formData = new FormData(e.currentTarget);
      const assignedUserName = formData.get('assigned_user') as string;
      
      // Find the user ID based on username (if assigned)
      let assigned_user_id = null;
      if (assignedUserName && assignedUserName !== '') {
        const user = users.find(u => u.username === assignedUserName);
        if (user) {
          assigned_user_id = user.id;
        }
      }
      
      const updatedDevice = {
        name: formData.get('name') as string,
        status: formData.get('status') as string,
        assigned_user_id: assigned_user_id,
        location: formData.get('location') as string,
      };
      
      await window.electronAPI.devices.update(selectedDevice.id, updatedDevice);
      await loadDevices(); // Refresh the device list
      setShowEditModal(false);
      setSelectedDevice(null);
      console.log('Device updated successfully:', selectedDevice.id);
    } catch (error) {
      console.error('Failed to update device:', error);
      alert('Failed to update device. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      case 'maintenance':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'retired':
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Monitor className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'retired':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.assigned_user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Devices</h1>
          <p className="text-muted-foreground">Manage and monitor your IT devices</p>
        </div>
        {hasPermission('create_devices') && (
          <ModernButton
            onClick={() => setShowAddModal(true)}
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
          >
            Add Device
          </ModernButton>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search devices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
          <option value="retired">Retired</option>
        </select>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDevices.map((device) => (
          <div key={device.id} className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Monitor className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{device.name}</h3>
                  <p className="text-sm text-muted-foreground">{device.device_type_name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                  {getStatusIcon(device.status)}
                  <span className="ml-1 capitalize">{device.status}</span>
                </span>
                <div className="relative group">
                  <button className="p-1 hover:bg-accent rounded">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-card border rounded-md shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleViewDevice(device)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </button>
                    {hasPermission('edit_devices') && (
                      <button
                        onClick={() => handleEditDevice(device)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Device
                      </button>
                    )}
                    {hasPermission('delete_devices') && (
                      <button
                        onClick={() => handleDeleteDevice(device.id)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Device
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Assigned to:</span>
                <span className="font-medium">{device.assigned_user_name || 'Unassigned'}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{device.location}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">OS:</span>
                <span className="font-medium">{device.os_name} {device.os_version}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Processor:</span>
                <span className="font-medium">{device.processor || 'Unknown'}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">RAM:</span>
                <span className="font-medium">{device.ram_gb} GB</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Storage:</span>
                <span className="font-medium">
                  {device.disk_used_gb || 0} / {device.disk_space_gb} GB
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">IP Address:</span>
                <span className="font-medium font-mono">{device.ip_address || 'N/A'}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Seen:</span>
                <span className="font-medium">
                  {device.last_seen ? new Date(device.last_seen).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Antivirus:</span>
                <span className={`px-2 py-1 rounded ${
                  device.antivirus_status && device.antivirus_status !== 'No Antivirus Detected'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {device.antivirus_status || 'Unknown'}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs mt-2">
                <span className="text-muted-foreground">Updates:</span>
                <span className={`px-2 py-1 rounded ${
                  device.update_status === 'Up to Date'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {device.update_status || 'Unknown'}
                </span>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <ModernButton 
                onClick={() => handleViewDevice(device)}
                variant="secondary"
                size="sm"
                icon={<Eye className="h-4 w-4" />}
                className="flex-1"
              >
                View
              </ModernButton>
              {hasPermission('edit_devices') && (
                <ModernButton 
                  onClick={() => handleEditDevice(device)}
                  variant="primary"
                  size="sm"
                  icon={<Edit className="h-4 w-4" />}
                  className="flex-1"
                >
                  Edit
                </ModernButton>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredDevices.length === 0 && (
        <div className="text-center py-12">
          <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No devices found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first device.'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <ModernButton
              onClick={() => setShowAddModal(true)}
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
            >
              Add Device
            </ModernButton>
          )}
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Device Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('fields.deviceName')}</label>
                <p className="text-sm text-foreground">{selectedDevice.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('fields.type')}</label>
                <p className="text-sm text-foreground">{selectedDevice.device_type_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('fields.status')}</label>
                <p className="text-sm text-foreground">{selectedDevice.status}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('fields.assignedUser')}</label>
                <p className="text-sm text-foreground">{selectedDevice.assigned_user_name || 'Unassigned'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('fields.location')}</label>
                <p className="text-sm text-foreground">{selectedDevice.location}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('fields.operatingSystem')}</label>
                <p className="text-sm text-foreground">{selectedDevice.os_name} {selectedDevice.os_version}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('fields.processor')}</label>
                <p className="text-sm text-foreground">{selectedDevice.processor || 'Unknown'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('fields.ram')}</label>
                <p className="text-sm text-foreground">{selectedDevice.ram_gb} GB</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('fields.storage')}</label>
                <p className="text-sm text-foreground">{selectedDevice.disk_used_gb || 0} / {selectedDevice.disk_space_gb} GB</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('fields.ipAddress')}</label>
                <p className="text-sm text-foreground font-mono">{selectedDevice.ip_address || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('fields.macAddress')}</label>
                <p className="text-sm text-foreground font-mono">{selectedDevice.mac_address || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('fields.hostname')}</label>
                <p className="text-sm text-foreground font-mono">{selectedDevice.hostname || 'Unknown'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('fields.manufacturer')}</label>
                <p className="text-sm text-foreground">{selectedDevice.manufacturer || 'Unknown'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('fields.model')}</label>
                <p className="text-sm text-foreground">{selectedDevice.model || 'Unknown'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('fields.serialNumber')}</label>
                <p className="text-sm text-foreground font-mono">{selectedDevice.serial_number || 'Unknown'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('fields.lastSeen')}</label>
                <p className="text-sm text-foreground">
                  {selectedDevice.last_seen ? new Date(selectedDevice.last_seen).toLocaleDateString() : 'Never'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('fields.antivirusStatus')}</label>
                <p className="text-sm text-foreground">{selectedDevice.antivirus_status || 'Unknown'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('fields.updateStatus')}</label>
                <p className="text-sm text-foreground">{selectedDevice.update_status || 'Unknown'}</p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <ModernButton
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedDevice(null);
                }}
                variant="secondary"
              >
                Close
              </ModernButton>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Edit Device</h2>
            <form onSubmit={handleUpdateDevice}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('fields.deviceName')}</label>
                  <input 
                    type="text" 
                    name="name"
                    defaultValue={selectedDevice.name} 
                    className="w-full px-3 py-2 border border-input rounded-md" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('fields.status')}</label>
                  <select name="status" defaultValue={selectedDevice.status} className="w-full px-3 py-2 border border-input rounded-md" required>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('fields.assignedUser')}</label>
                  <select name="assigned_user" defaultValue={selectedDevice.assigned_user_name || ''} className="w-full px-3 py-2 border border-input rounded-md">
                    <option value="">Unassigned</option>
                    {users.map(user => (
                      <option key={user.id} value={user.username}>{user.firstName} {user.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('fields.location')}</label>
                  <input 
                    type="text" 
                    name="location"
                    defaultValue={selectedDevice.location} 
                    className="w-full px-3 py-2 border border-input rounded-md" 
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <ModernButton
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedDevice(null);
                  }}
                  variant="secondary"
                >
                  Cancel
                </ModernButton>
                <ModernButton type="submit" variant="primary">
                  Update Device
                </ModernButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevicesPage;
