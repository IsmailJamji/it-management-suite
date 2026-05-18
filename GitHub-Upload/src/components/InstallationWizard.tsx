import React, { useState, useEffect } from 'react';
import { Monitor, Server, Laptop, Wifi, WifiOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface InstallationWizardProps {
  onModeSelected: (mode: 'server' | 'client' | 'local', serverInfo?: { name: string; ip: string }) => void;
  onCancel: () => void;
}

const InstallationWizard: React.FC<InstallationWizardProps> = ({ onModeSelected, onCancel }) => {
  const { t } = useLanguage();
  const [selectedMode, setSelectedMode] = useState<'server' | 'client' | 'local' | null>(null);
  const [serverInfo, setServerInfo] = useState({ name: '', ip: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [discoveredServers, setDiscoveredServers] = useState<Array<{ name: string; ip: string }>>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');

  useEffect(() => {
    if (selectedMode === 'client') {
      discoverServers();
    }
  }, [selectedMode]);

  const discoverServers = async () => {
    if (!window.electronAPI?.installation) return;
    
    setIsDiscovering(true);
    try {
      const servers = await window.electronAPI.installation.discoverServers();
      setDiscoveredServers(servers || []);
    } catch (error) {
      console.error('Server discovery failed:', error);
      setDiscoveredServers([]);
    } finally {
      setIsDiscovering(false);
    }
  };

  const testServerConnection = async (server: { name: string; ip: string }) => {
    if (!window.electronAPI?.installation) return;
    
    try {
      const result = await window.electronAPI.installation.testServer(server);
      const success = typeof result === 'boolean' ? result : (result as any)?.success || false;
      setConnectionStatus(success ? 'connected' : 'disconnected');
      return success;
    } catch (error) {
      console.error('Server test failed:', error);
      setConnectionStatus('disconnected');
      return false;
    }
  };

  const handleModeSelect = (mode: 'server' | 'client' | 'local') => {
    setSelectedMode(mode);
    if (mode === 'local') {
      setServerInfo({ name: 'Local Database', ip: 'localhost' });
    }
  };

  const handleServerSelect = (server: { name: string; ip: string }) => {
    setServerInfo(server);
    testServerConnection(server);
  };

  const handleContinue = async () => {
    if (!selectedMode) return;
    
    setIsLoading(true);
    try {
      await onModeSelected(selectedMode, selectedMode === 'client' ? serverInfo : undefined);
    } catch (error) {
      console.error('Mode selection failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canContinue = () => {
    if (!selectedMode) return false;
    if (selectedMode === 'client') {
      return serverInfo.name && serverInfo.ip && connectionStatus === 'connected';
    }
    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="max-w-4xl w-full space-y-8 p-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-primary flex items-center justify-center mb-6">
            <Monitor className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Welcome to IT Management Suite</h1>
          <p className="text-lg text-muted-foreground">
            Choose your installation mode to get started
          </p>
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Local Mode */}
          <div
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedMode === 'local'
                ? 'border-primary bg-primary/10 shadow-lg'
                : 'border-border hover:border-primary/50 hover:shadow-md'
            }`}
            onClick={() => handleModeSelect('local')}
          >
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Laptop className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Local Mode</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Standalone installation with local database. Perfect for single-user or small teams.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Local SQLite database</li>
                <li>• No network required</li>
                <li>• Full offline functionality</li>
                <li>• Easy setup and maintenance</li>
              </ul>
            </div>
          </div>

          {/* Client Mode */}
          <div
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedMode === 'client'
                ? 'border-primary bg-primary/10 shadow-lg'
                : 'border-border hover:border-primary/50 hover:shadow-md'
            }`}
            onClick={() => handleModeSelect('client')}
          >
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Wifi className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Client Mode</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect to a central server. Ideal for multi-user environments.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Centralized database</li>
                <li>• Real-time collaboration</li>
                <li>• Network connectivity required</li>
                <li>• Managed by IT administrator</li>
              </ul>
            </div>
          </div>

          {/* Server Mode */}
          <div
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedMode === 'server'
                ? 'border-primary bg-primary/10 shadow-lg'
                : 'border-border hover:border-primary/50 hover:shadow-md'
            }`}
            onClick={() => handleModeSelect('server')}
          >
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Server className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Server Mode</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Set up as a central server. For IT administrators managing multiple clients.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Central database server</li>
                <li>• Client management</li>
                <li>• Network sharing enabled</li>
                <li>• Administrative controls</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Server Selection (for Client Mode) */}
        {selectedMode === 'client' && (
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Select Server</h3>
            
            {/* Discovered Servers */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-foreground">Discovered Servers</h4>
                <button
                  onClick={discoverServers}
                  disabled={isDiscovering}
                  className="text-xs text-primary hover:text-primary/80 disabled:opacity-50"
                >
                  {isDiscovering ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                      Discovering...
                    </>
                  ) : (
                    'Refresh'
                  )}
                </button>
              </div>
              
              {discoveredServers.length > 0 ? (
                <div className="space-y-2">
                  {discoveredServers.map((server, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded border cursor-pointer transition-colors ${
                        serverInfo.name === server.name && serverInfo.ip === server.ip
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleServerSelect(server)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{server.name}</p>
                          <p className="text-sm text-muted-foreground">{server.ip}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {connectionStatus === 'connected' && serverInfo.name === server.name ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : connectionStatus === 'disconnected' && serverInfo.name === server.name ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No servers discovered. Try refreshing or enter manually.</p>
              )}
            </div>

            {/* Manual Server Entry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Server Name</label>
                <input
                  type="text"
                  value={serverInfo.name}
                  onChange={(e) => setServerInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., IT-Server-01"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Server IP Address</label>
                <input
                  type="text"
                  value={serverInfo.ip}
                  onChange={(e) => setServerInfo(prev => ({ ...prev, ip: e.target.value }))}
                  placeholder="e.g., 192.168.1.100"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Test Connection Button */}
            {serverInfo.name && serverInfo.ip && (
              <div className="mt-4">
                <button
                  onClick={() => testServerConnection(serverInfo)}
                  className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                >
                  Test Connection
                </button>
                {connectionStatus === 'connected' && (
                  <span className="ml-2 text-sm text-green-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Connection successful
                  </span>
                )}
                {connectionStatus === 'disconnected' && (
                  <span className="ml-2 text-sm text-red-600 flex items-center">
                    <WifiOff className="h-4 w-4 mr-1" />
                    Connection failed
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleContinue}
            disabled={!canContinue() || isLoading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Setting up...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallationWizard;
