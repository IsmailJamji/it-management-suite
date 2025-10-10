import React, { useState, useEffect } from 'react';
import { Copy, Check, Wifi, Server, FolderOpen, RefreshCw } from 'lucide-react';
import ModernIcon from './ModernIcon';

interface ServerInfo {
  name: string;
  ip: string;
  sharedPath: string;
}

const ServerInfoCard: React.FC = () => {
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServerInfo();
  }, []);

  const loadServerInfo = async () => {
    try {
      setLoading(true);
      if (window.electronAPI?.installation) {
        // Use the verification method to get detailed server status
        const verification = await window.electronAPI.installation.verifyServerMode();
        console.log('Server mode verification:', verification);
        
        if (verification.isServerMode && verification.networkInfo) {
          setServerInfo(verification.networkInfo);
        } else {
          console.log('Server mode issues:', verification.issues);
          setServerInfo(null);
        }
      }
    } catch (error) {
      console.error('Failed to load server info:', error);
      setServerInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <ModernIcon name="server" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Server Information</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded mb-2"></div>
          <div className="h-4 bg-muted rounded mb-2"></div>
          <div className="h-4 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!serverInfo) {
    return (
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <ModernIcon name="server" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Server Information</h3>
        </div>
        <div className="space-y-3">
          <p className="text-muted-foreground">Not running in server mode</p>
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>To enable server mode:</strong>
            </p>
            <ol className="text-sm text-orange-700 mt-2 space-y-1">
              <li>1. Go to the login page</li>
              <li>2. Click "Mode Switcher"</li>
              <li>3. Select "Server" mode</li>
              <li>4. Apply changes</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ModernIcon name="server" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Server Information</h3>
        </div>
        <button
          onClick={loadServerInfo}
          disabled={loading}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Server Name */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-3">
            <ModernIcon name="wifi" size={16} className="text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Server Name</p>
              <p className="text-sm text-muted-foreground">Computer name for client connection</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <code className="px-2 py-1 bg-background border rounded text-sm font-mono">
              {serverInfo.name}
            </code>
            <button
              onClick={() => copyToClipboard(serverInfo.name, 'name')}
              className="p-1 hover:bg-accent rounded transition-colors"
              title="Copy server name"
            >
              {copiedField === 'name' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Server IP */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-3">
            <ModernIcon name="wifi" size={16} className="text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Server IP Address</p>
              <p className="text-sm text-muted-foreground">IP address for client connection</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <code className="px-2 py-1 bg-background border rounded text-sm font-mono">
              {serverInfo.ip}
            </code>
            <button
              onClick={() => copyToClipboard(serverInfo.ip, 'ip')}
              className="p-1 hover:bg-accent rounded transition-colors"
              title="Copy IP address"
            >
              {copiedField === 'ip' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Shared Folder Path */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-3">
            <FolderOpen className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Shared Folder</p>
              <p className="text-sm text-muted-foreground">Database location on server</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <code className="px-2 py-1 bg-background border rounded text-sm font-mono max-w-xs truncate">
              {serverInfo.sharedPath}
            </code>
            <button
              onClick={() => copyToClipboard(serverInfo.sharedPath, 'path')}
              className="p-1 hover:bg-accent rounded transition-colors"
              title="Copy shared folder path"
            >
              {copiedField === 'path' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">For Client Setup:</h4>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Copy the Server Name and IP Address above</li>
          <li>2. On client PC, set mode to "Client"</li>
          <li>3. Enter the server details in the client setup</li>
          <li>4. Test connection using "Diagnose Connection" button</li>
        </ol>
      </div>
    </div>
  );
};

export default ServerInfoCard;
