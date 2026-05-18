import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ModernButton from '../components/ModernButton';
import ModernIcon from '../components/ModernIcon';
import { useNotifications } from '../contexts/NotificationContext';

interface DatabasePathSettings {
  currentPath: string;
  availablePaths: Array<{
    name: string;
    path: string;
    type: 'local' | 'onedrive' | 'googledrive' | 'network';
    status: 'available' | 'unavailable';
  }>;
}

interface UserPermissions {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  permissions: {
    view_dashboard: boolean;
    view_tasks: boolean;
    view_projects: boolean;
    view_devices: boolean;
    view_it_assets: boolean;
    view_telecom_assets: boolean;
    view_users: boolean;
    view_system_info: boolean;
    view_ai: boolean;
    edit_tasks: boolean;
    edit_projects: boolean;
    edit_devices: boolean;
    edit_it_assets: boolean;
    edit_telecom_assets: boolean;
    edit_users: boolean;
    admin_access: boolean;
  };
}

type SettingsTab = 'database' | 'permissions' | 'general' | 'security';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<SettingsTab>('database');
  
  // Database settings state
  const [databaseSettings, setDatabaseSettings] = useState<DatabasePathSettings>({
    currentPath: '',
    availablePaths: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string>('');

  // Permissions state
  const [users, setUsers] = useState<UserPermissions[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserPermissions | null>(null);
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);

  useEffect(() => {
    if (activeTab === 'database') {
      loadDatabaseSettings();
    } else if (activeTab === 'permissions') {
      loadUsers();
    }
  }, [activeTab]);

  const loadDatabaseSettings = async () => {
    try {
      setIsLoading(true);
      
      // Get current database path
      const currentPath = await window.electronAPI?.installation?.getCurrentDatabasePath?.();
      
      // Scan for available paths
      const availablePaths = await scanAvailablePaths();
      
      setDatabaseSettings({
        currentPath: currentPath || '',
        availablePaths
      });
      
      setSelectedPath(currentPath || '');
    } catch (error) {
      console.error('Error loading database settings:', error);
      addNotification({ type: 'error', title: 'Error', message: 'Failed to load database settings' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const usersData = await window.electronAPI?.users?.getAll?.();
      
      // Add default permissions if not present
      const usersWithPermissions = (usersData || []).map(user => ({
        ...user,
        permissions: {
          view_dashboard: true,
          view_tasks: true,
          view_projects: true,
          view_devices: true,
          view_it_assets: true,
          view_telecom_assets: true,
          view_users: user.role === 'admin',
          view_system_info: user.role === 'admin',
          view_ai: true,
          edit_tasks: user.role === 'admin' || user.role === 'user',
          edit_projects: user.role === 'admin' || user.role === 'user',
          edit_devices: user.role === 'admin' || user.role === 'user',
          edit_it_assets: user.role === 'admin' || user.role === 'user',
          edit_telecom_assets: user.role === 'admin' || user.role === 'user',
          edit_users: user.role === 'admin',
          admin_access: user.role === 'admin',
          ...user.permissions // Override with existing permissions if any
        }
      }));
      
      setUsers(usersWithPermissions);
    } catch (error) {
      console.error('Error loading users:', error);
      addNotification({ type: 'error', title: 'Error', message: 'Failed to load users' });
    } finally {
      setIsLoading(false);
    }
  };

  const scanAvailablePaths = async (): Promise<Array<{
    name: string;
    path: string;
    type: 'local' | 'onedrive' | 'googledrive' | 'network';
    status: 'available' | 'unavailable';
  }>> => {
    const paths = [];
    
    try {
      // Check local path
      const localPath = await window.electronAPI?.installation?.getLocalDatabasePath?.();
      if (localPath) {
        paths.push({
          name: 'Local Database',
          path: localPath,
          type: 'local' as const,
          status: 'available' as const
        });
      }
      
      // Check OneDrive path
      const oneDrivePath = await window.electronAPI?.installation?.getOneDriveDatabasePath?.();
      if (oneDrivePath) {
        paths.push({
          name: 'OneDrive Sync',
          path: oneDrivePath,
          type: 'onedrive' as const,
          status: 'available' as const
        });
      } else {
        // Add OneDrive path even if folder doesn't exist yet
        const oneDrivePath = await window.electronAPI?.installation?.getPotentialOneDriveDatabasePath?.();
        paths.push({
          name: 'OneDrive Sync (Create)',
          path: oneDrivePath,
          type: 'onedrive' as const,
          status: 'unavailable' as const
        });
      }
      
      // Check Google Drive path
      const googleDrivePath = await window.electronAPI?.installation?.getGoogleDriveDatabasePath?.();
      if (googleDrivePath) {
        paths.push({
          name: 'Google Drive Sync',
          path: googleDrivePath,
          type: 'googledrive' as const,
          status: 'available' as const
        });
      } else {
        // Add Google Drive path even if folder doesn't exist yet
        const googleDrivePath = await window.electronAPI?.installation?.getPotentialGoogleDriveDatabasePath?.();
        paths.push({
          name: 'Google Drive Sync (Create)',
          path: googleDrivePath,
          type: 'googledrive' as const,
          status: 'unavailable' as const
        });
      }
      
      // Check network paths
      const networkPaths = await window.electronAPI?.installation?.getNetworkDatabasePaths?.();
      if (networkPaths && networkPaths.length > 0) {
        networkPaths.forEach((path, index) => {
          paths.push({
            name: `Network Share ${index + 1}`,
            path: path,
            type: 'network' as const,
            status: 'available' as const
          });
        });
      }
    } catch (error) {
      console.error('Error scanning paths:', error);
    }
    
    return paths;
  };

  const handlePathChange = async () => {
    if (!selectedPath) {
      addNotification({ type: 'warning', title: 'Warning', message: 'Please select a database path' });
      return;
    }

    try {
      setIsLoading(true);
      
      // Check if the selected path is a OneDrive/Google Drive path that doesn't exist yet
      if (selectedPath.includes('OneDrive') || selectedPath.includes('Google Drive')) {
        const folderPath = selectedPath.replace('/database.db', '').replace('\\database.db', '');
        
        // Create the sync folder if it doesn't exist
        const folderType = selectedPath.includes('OneDrive') ? 'onedrive' : 'googledrive';
        const folderCreated = await window.electronAPI?.installation?.createSyncFolder?.(folderType);
        
        if (!folderCreated) {
          addNotification({ type: 'error', title: 'Error', message: `Failed to create ${folderType === 'onedrive' ? 'OneDrive' : 'Google Drive'} folder` });
          return;
        }
      }
      
      // Update database path
      const success = await window.electronAPI?.installation?.setDatabasePath?.(selectedPath);
      
      if (success) {
        addNotification({ type: 'success', title: 'Success', message: 'Database path updated successfully' });
        await loadDatabaseSettings();
      } else {
        addNotification({ type: 'error', title: 'Error', message: 'Failed to update database path' });
      }
    } catch (error) {
      console.error('Error updating path:', error);
      addNotification({ type: 'error', title: 'Error', message: 'Failed to update database path' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async (path: string) => {
    try {
      const result = await window.electronAPI?.installation?.testDatabaseConnection?.(path);
      if (result) {
        addNotification({ type: 'success', title: 'Success', message: 'Connection test successful' });
      } else {
        addNotification({ type: 'error', title: 'Error', message: 'Connection test failed' });
      }
    } catch (error) {
      addNotification({ type: 'error', title: 'Error', message: 'Connection test failed' });
    }
  };

  const handleCreateSyncFolder = async (type: 'onedrive' | 'googledrive') => {
    try {
      const result = await window.electronAPI?.installation?.createSyncFolder?.(type);
      if (result) {
        addNotification({ type: 'success', title: 'Success', message: `${type === 'onedrive' ? 'OneDrive' : 'Google Drive'} folder created successfully` });
        await loadDatabaseSettings();
      } else {
        addNotification({ type: 'error', title: 'Error', message: `Failed to create ${type === 'onedrive' ? 'OneDrive' : 'Google Drive'} folder` });
      }
    } catch (error) {
      addNotification({ type: 'error', title: 'Error', message: `Failed to create ${type === 'onedrive' ? 'OneDrive' : 'Google Drive'} folder` });
    }
  };

  const handlePermissionChange = (userId: number, permission: string, value: boolean) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const updatedPermissions = {
        ...user.permissions,
        [permission]: value
      };

      // Update local state immediately
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, permissions: updatedPermissions }
          : u
      ));

      // Update selected user if it's the same user
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({
          ...selectedUser,
          permissions: updatedPermissions
        });
      }

      addNotification({ 
        type: 'success', 
        title: 'Success', 
        message: 'Permissions updated successfully' 
      });
    } catch (error) {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to update permissions' });
    }
  };

  const renderDatabaseTab = () => (
    <div className="space-y-6">
      {/* Current Path */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Current Database Path</h3>
        <div className="flex items-center space-x-3">
          <ModernIcon name="database" size={20} className="text-muted-foreground" />
          <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">
            {databaseSettings.currentPath || 'Not set'}
          </code>
          <ModernButton
            onClick={() => handleTestConnection(databaseSettings.currentPath)}
            variant="info"
            size="sm"
            icon={<ModernIcon name="wifi" size={16} />}
          >
            Test
          </ModernButton>
        </div>
      </div>

      {/* Available Paths */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Available Database Paths</h3>
        
        {databaseSettings.availablePaths.length === 0 ? (
          <div className="text-center py-8">
            <ModernIcon name="database" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No database paths found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create sync folders to enable automatic sync between PCs
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {databaseSettings.availablePaths.map((path, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedPath === path.path
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedPath(path.path)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ModernIcon 
                      name={path.type === 'onedrive' ? 'wifi' : 
                            path.type === 'googledrive' ? 'wifi' : 
                            path.type === 'network' ? 'wifi' : 'database'} 
                      size={20} 
                      className="text-muted-foreground" 
                    />
                    <div>
                      <h4 className="font-medium text-foreground">{path.name}</h4>
                      <p className="text-sm text-muted-foreground font-mono">{path.path}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      path.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {path.status === 'available' ? 'Available' : 'Unavailable'}
                    </span>
                    <ModernButton
                      onClick={() => handleTestConnection(path.path)}
                      variant="info"
                      size="sm"
                      icon={<ModernIcon name="wifi" size={16} />}
                    >
                      Test
                    </ModernButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sync Setup */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Setup Automatic Sync</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* OneDrive Setup */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <ModernIcon name="wifi" size={20} className="text-blue-600" />
              <h4 className="font-medium text-foreground">OneDrive Sync</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Sync database files automatically using OneDrive
            </p>
            <ModernButton
              onClick={() => handleCreateSyncFolder('onedrive')}
              variant="primary"
              size="sm"
              icon={<ModernIcon name="plus" size={16} />}
            >
              Setup OneDrive
            </ModernButton>
          </div>

          {/* Google Drive Setup */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <ModernIcon name="wifi" size={20} className="text-green-600" />
              <h4 className="font-medium text-foreground">Google Drive Sync</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Sync database files automatically using Google Drive
            </p>
            <ModernButton
              onClick={() => handleCreateSyncFolder('googledrive')}
              variant="success"
              size="sm"
              icon={<ModernIcon name="plus" size={16} />}
            >
              Setup Google Drive
            </ModernButton>
          </div>
        </div>
      </div>

      {/* Apply Changes */}
      {selectedPath && selectedPath !== databaseSettings.currentPath && (
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-foreground">Apply Database Path Change</h4>
              <p className="text-sm text-muted-foreground">
                This will change the database path and may require app restart
              </p>
            </div>
            <ModernButton
              onClick={handlePathChange}
              variant="primary"
              loading={isLoading}
              icon={<ModernIcon name="save" size={16} />}
            >
              Apply Changes
            </ModernButton>
          </div>
        </div>
      )}
    </div>
  );

  const renderPermissionsTab = () => (
    <div className="space-y-6">
      {/* Users List */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">User Permissions</h3>
        
        {users.length === 0 ? (
          <div className="text-center py-8">
            <ModernIcon name="users" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedUser?.id === user.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ModernIcon name="user" size={20} className="text-muted-foreground" />
                    <div>
                      <h4 className="font-medium text-foreground">{user.name}</h4>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : user.role === 'user'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <ModernButton
                    onClick={() => {
                      setSelectedUser(user);
                      setIsEditingPermissions(true);
                    }}
                    variant="secondary"
                    size="sm"
                    icon={<ModernIcon name="edit" size={16} />}
                  >
                    Edit
                  </ModernButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permission Editor */}
      {selectedUser && isEditingPermissions && (
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Edit Permissions - {selectedUser.name}
            </h3>
            <div className="flex space-x-2">
              <ModernButton
                onClick={() => setIsEditingPermissions(false)}
                variant="secondary"
                size="sm"
              >
                Cancel
              </ModernButton>
              <ModernButton
                onClick={() => setIsEditingPermissions(false)}
                variant="primary"
                size="sm"
                icon={<ModernIcon name="save" size={16} />}
              >
                Save
              </ModernButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* View Permissions */}
            <div>
              <h4 className="font-medium text-foreground mb-3">View Permissions</h4>
              <div className="space-y-2">
                {[
                  { key: 'view_dashboard', label: 'Dashboard' },
                  { key: 'view_tasks', label: 'Tasks' },
                  { key: 'view_projects', label: 'Projects' },
                  { key: 'view_devices', label: 'Devices' },
                  { key: 'view_it_assets', label: 'IT Assets' },
                  { key: 'view_telecom_assets', label: 'Telecom Assets' },
                  { key: 'view_users', label: 'Users' },
                  { key: 'view_system_info', label: 'System Info' },
                  { key: 'view_ai', label: 'AI Assistant' }
                ].map((permission) => (
                  <label key={permission.key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedUser.permissions[permission.key as keyof typeof selectedUser.permissions]}
                      onChange={(e) => handlePermissionChange(selectedUser.id, permission.key, e.target.checked)}
                      className="rounded border-input"
                    />
                    <span className="text-sm text-foreground">{permission.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Edit Permissions */}
            <div>
              <h4 className="font-medium text-foreground mb-3">Edit Permissions</h4>
              <div className="space-y-2">
                {[
                  { key: 'edit_tasks', label: 'Edit Tasks' },
                  { key: 'edit_projects', label: 'Edit Projects' },
                  { key: 'edit_devices', label: 'Edit Devices' },
                  { key: 'edit_it_assets', label: 'Edit IT Assets' },
                  { key: 'edit_telecom_assets', label: 'Edit Telecom Assets' },
                  { key: 'edit_users', label: 'Edit Users' },
                  { key: 'admin_access', label: 'Admin Access' }
                ].map((permission) => (
                  <label key={permission.key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedUser.permissions[permission.key as keyof typeof selectedUser.permissions]}
                      onChange={(e) => handlePermissionChange(selectedUser.id, permission.key, e.target.checked)}
                      className="rounded border-input"
                    />
                    <span className="text-sm text-foreground">{permission.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">General Settings</h3>
        <p className="text-muted-foreground">General application settings will be added here.</p>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Security Settings</h3>
        <p className="text-muted-foreground">Security settings will be added here.</p>
      </div>
    </div>
  );

  const tabs = [
    { id: 'database', label: 'Database', icon: 'database' },
    { id: 'permissions', label: 'Permissions', icon: 'users' },
    { id: 'general', label: 'General', icon: 'settings' },
    { id: 'security', label: 'Security', icon: 'shield' }
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage application settings and configurations
          </p>
        </div>
        <ModernButton
          onClick={() => {
            if (activeTab === 'database') loadDatabaseSettings();
            else if (activeTab === 'permissions') loadUsers();
          }}
          variant="secondary"
          icon={<ModernIcon name="refresh" size={16} />}
          disabled={isLoading}
        >
          Refresh
        </ModernButton>
      </div>

      {/* Tabs */}
      <div className="bg-card rounded-lg border">
        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary text-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <ModernIcon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'database' && renderDatabaseTab()}
          {activeTab === 'permissions' && renderPermissionsTab()}
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'security' && renderSecurityTab()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;