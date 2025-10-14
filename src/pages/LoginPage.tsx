import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import ModernIcon from '../components/ModernIcon';
import { Eye, EyeOff, Loader2, UserPlus, LogIn } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [department, setDepartment] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentMode, setCurrentMode] = useState<'server' | 'client' | 'local' | 'cloud'>('local');
  const [showModeSwitcher, setShowModeSwitcher] = useState(false);
  const [serverInfo, setServerInfo] = useState({ name: '', ip: '' });
  const [isChangingMode, setIsChangingMode] = useState(false);
  const [discoveredServers, setDiscoveredServers] = useState<Array<{ name: string; ip: string; status: 'online' | 'offline' }>>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'server' | 'client' | 'local' | 'cloud' | null>(null);
  const { login, register } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    loadCurrentMode();
  }, []);

  const loadCurrentMode = async () => {
    try {
      if (window.electronAPI?.installation) {
        const config = await window.electronAPI.installation.getConfig();
        if (config?.mode) {
          setCurrentMode(config.mode);
        }
      }
    } catch (error) {
      console.error('Failed to load current mode:', error);
    }
  };

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

  const handleModeChange = async (mode: 'server' | 'client' | 'local' | 'cloud', serverInfo?: { name: string; ip: string }) => {
    setIsChangingMode(true);
    let isConnected = false; // Declare at function scope
    
    try {
      if (window.electronAPI?.installation) {
        // For client mode, validate server info
        if (mode === 'client') {
          if (!serverInfo?.name || !serverInfo?.ip) {
            alert('Please enter server name and IP address for client mode.');
            setIsChangingMode(false);
            return;
          }
          
          // Test server connection with retry mechanism
          let retryCount = 0;
          const maxRetries = 3;
          
          while (!isConnected && retryCount < maxRetries) {
            try {
              console.log(`🔄 Attempting connection (${retryCount + 1}/${maxRetries})...`);
              isConnected = await window.electronAPI.installation.testServer(serverInfo);
              
              if (isConnected) {
                console.log('✅ Server connection successful');
                break;
              } else {
                retryCount++;
                if (retryCount < maxRetries) {
                  console.log(`⏳ Retrying connection in 2 seconds...`);
                  await new Promise(resolve => setTimeout(resolve, 2000));
                }
              }
            } catch (error) {
              console.log(`❌ Connection attempt ${retryCount + 1} failed:`, error);
              retryCount++;
              if (retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            }
          }
          
          if (!isConnected) {
            const useOfflineMode = confirm(
              'Cannot connect to server after multiple attempts.\n\n' +
              'Would you like to:\n' +
              '• Click OK to use offline mode (local database)\n' +
              '• Click Cancel to try again later'
            );
            
            if (!useOfflineMode) {
              setIsChangingMode(false);
              return;
            }
            
            // Continue with offline mode
            console.log('⚠️ Proceeding with offline mode due to connection failure');
          }
        }
        
        // Set the mode
        await window.electronAPI.installation.setMode(mode, serverInfo);
        setCurrentMode(mode);
        setShowModeSwitcher(false);
        
        // Show success message with mode-specific information
        let message = `Mode changed to ${mode.charAt(0).toUpperCase() + mode.slice(1)} successfully!`;
        if (mode === 'server') {
          message += '\n\nServer mode: Database is now shared and accessible to other clients.';
        } else if (mode === 'client') {
          if (isConnected) {
            message += `\n\nClient mode: Connected to server ${serverInfo?.name} (${serverInfo?.ip}).`;
          } else {
            message += '\n\nClient mode: Using offline mode. Will sync when server becomes available.';
          }
        } else if (mode === 'cloud') {
          message += '\n\nCloud mode: Using cloud storage (OneDrive/Google Drive) for automatic sync.';
        } else {
          message += '\n\nLocal mode: Using local database for standalone operation.';
        }
        
        alert(message);
        
        // Reload the page to apply the new configuration
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to change mode:', error);
      alert('Failed to change mode. Please try again.');
    } finally {
      setIsChangingMode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      if (isRegisterMode) {
        if (password !== confirmPassword) {
          alert('Passwords do not match');
          return;
        }
        await register({ username, password, firstName, lastName, email, department });
      } else {
        await login(email, password);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="max-w-md w-full space-y-8 p-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary flex items-center justify-center mb-4">
            <ModernIcon name="monitor" size={32} className="text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">{t('app.title')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('login.subtitle')}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <ModernIcon name="settings" size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{t('login.applicationMode')}</span>
          </div>
          <button
            onClick={() => setShowModeSwitcher(!showModeSwitcher)}
            className="text-xs text-primary hover:text-primary/80 flex items-center space-x-1"
          >
            <span>{t('login.changeMode')}</span>
            <ModernIcon name="settings" size={12} />
          </button>
          </div>
          
          <div className="flex items-center space-x-2">
            {currentMode === 'local' && <ModernIcon name="laptop" size={16} />}
            {currentMode === 'client' && <ModernIcon name="wifi" size={16} />}
            {currentMode === 'server' && <ModernIcon name="server" size={16} />}
            {currentMode === 'cloud' && <ModernIcon name="wifi" size={16} />}
            <span className="text-sm text-muted-foreground">
              {t('login.current')}: <span className="font-medium text-foreground capitalize">{t(`login.modes.${currentMode}`)}</span>
            </span>
          </div>

          {showModeSwitcher && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Local Mode */}
                <button
                  onClick={() => setSelectedMode('local')}
                  disabled={isChangingMode || currentMode === 'local'}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedMode === 'local'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  } ${isChangingMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <ModernIcon name="laptop" size={16} />
                    <span className="text-sm font-medium text-foreground">Local</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Standalone mode</p>
                </button>

                {/* Client Mode */}
                <button
                  onClick={() => setSelectedMode('client')}
                  disabled={isChangingMode || currentMode === 'client'}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedMode === 'client'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  } ${isChangingMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <ModernIcon name="wifi" size={16} />
                    <span className="text-sm font-medium text-foreground">Client</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Connect to server</p>
                </button>

                {/* Server Mode */}
                <button
                  onClick={() => setSelectedMode('server')}
                  disabled={isChangingMode || currentMode === 'server'}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedMode === 'server'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  } ${isChangingMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <ModernIcon name="server" size={16} />
                    <span className="text-sm font-medium text-foreground">Server</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Central server</p>
                </button>

                {/* Cloud Mode */}
                <button
                  onClick={() => setSelectedMode('cloud')}
                  disabled={isChangingMode || currentMode === 'cloud'}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedMode === 'cloud'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  } ${isChangingMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <ModernIcon name="wifi" size={16} />
                    <span className="text-sm font-medium text-foreground">Cloud</span>
                  </div>
                  <p className="text-xs text-muted-foreground">OneDrive sync</p>
                </button>
              </div>

              {selectedMode === 'cloud' && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <ModernIcon name="wifi" size={16} className="text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 mb-1">Cloud Sync Setup</h4>
                      <p className="text-xs text-blue-700 mb-2">
                        This mode uses OneDrive/Google Drive for automatic database sync between PCs.
                      </p>
                      <div className="text-xs text-blue-600 space-y-1">
                        <p><strong>Setup Steps:</strong></p>
                        <p>1. Install OneDrive/Google Drive on both PCs</p>
                        <p>2. Create folder: <code>OneDrive\IT-Management-Data</code></p>
                        <p>3. Database will sync automatically</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedMode === 'client' && (
                <div className="mt-3 space-y-3">
                  {/* Server Discovery */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-medium text-foreground">{t('login.availableServers')}</label>
                      <button
                        onClick={discoverServers}
                        disabled={isDiscovering}
                        className="text-xs text-primary hover:text-primary/80 disabled:opacity-50 flex items-center space-x-1"
                      >
                        {isDiscovering ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Discovering...</span>
                          </>
                        ) : (
                          <>
                            <ModernIcon name="wifi" size={12} />
                            <span>Discover Servers</span>
                          </>
                        )}
                      </button>
                    </div>
                    
                    {discoveredServers.length > 0 ? (
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {discoveredServers.map((server, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded border cursor-pointer transition-colors text-xs ${
                              serverInfo.name === server.name && serverInfo.ip === server.ip
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => setServerInfo({ name: server.name, ip: server.ip })}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium text-foreground">{server.name}</span>
                                <span className="text-muted-foreground ml-2">({server.ip})</span>
                              </div>
                              <div className={`w-2 h-2 rounded-full ${
                                server.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No servers discovered. Enter manually below.</p>
                    )}
                  </div>

                  {/* Manual Server Entry */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">{t('login.serverName')}</label>
                      <input
                        type="text"
                        value={serverInfo.name}
                        onChange={(e) => setServerInfo(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., IT-Server-01"
                        className="w-full px-2 py-1 text-xs border border-input rounded bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">{t('login.serverIP')}</label>
                      <input
                        type="text"
                        value={serverInfo.ip}
                        onChange={(e) => setServerInfo(prev => ({ ...prev, ip: e.target.value }))}
                        placeholder="e.g., 192.168.1.100"
                        className="w-full px-2 py-1 text-xs border border-input rounded bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                  </div>

                  {/* Connection Diagnostics */}
                  {serverInfo.name && serverInfo.ip && (
                    <div className="mt-3">
                      <button
                        onClick={async () => {
                          try {
                            const result = await window.electronAPI?.installation?.diagnoseConnection(serverInfo);
                            if (result) {
                              let message = `Connection Diagnostics:\n\n`;
                              if (result.success) {
                                message += `✅ Connection successful!`;
                              } else {
                                message += `❌ Connection failed:\n\n`;
                                result.issues.forEach((issue, index) => {
                                  message += `${index + 1}. ${issue}\n`;
                                });
                                message += `\nSuggestions:\n`;
                                result.suggestions.forEach((suggestion, index) => {
                                  message += `${index + 1}. ${suggestion}\n`;
                                });
                              }
                              alert(message);
                            }
                          } catch (error) {
                            alert('Diagnostics failed: ' + error);
                          }
                        }}
                        className="w-full px-3 py-2 text-xs bg-orange-100 text-orange-800 hover:bg-orange-200 rounded border border-orange-200 transition-colors flex items-center justify-center space-x-1"
                      >
                        <ModernIcon name="wifi" size={12} />
                        <span>Diagnose Connection</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {selectedMode && (
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setSelectedMode(null);
                      setServerInfo({ name: '', ip: '' });
                    }}
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (selectedMode === 'client') {
                        handleModeChange('client', serverInfo);
                      } else {
                        handleModeChange(selectedMode);
                      }
                    }}
                    disabled={isChangingMode || (selectedMode === 'client' && (!serverInfo.name || !serverInfo.ip))}
                    className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isChangingMode ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                        Applying...
                      </>
                    ) : (
                      'Apply Changes'
                    )}
                  </button>
                </div>
              )}

              {isChangingMode && (
                <div className="mt-3 flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Changing mode...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Login/Register Form */}
        <div className="bg-card rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="flex bg-muted rounded-lg p-1">
              <button
                type="button"
                onClick={() => setIsRegisterMode(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  !isRegisterMode
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LogIn className="h-4 w-4 inline mr-2" />
                {t('login.signIn')}
              </button>
              <button
                type="button"
                onClick={() => setIsRegisterMode(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isRegisterMode
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserPlus className="h-4 w-4 inline mr-2" />
                {t('common.register')}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegisterMode && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                      {t('users.firstName')}
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      required={isRegisterMode}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      placeholder={t('users.firstName')}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                      {t('users.lastName')}
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      required={isRegisterMode}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      placeholder={t('users.lastName')}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                    {t('users.username')}
                  </label>
                  <input
                    id="username"
                    type="text"
                    required={isRegisterMode}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    placeholder={t('users.username')}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    {t('login.email')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    required={isRegisterMode}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    placeholder={t('login.email')}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-foreground mb-2">
                    {t('fields.department')}
                  </label>
                  <input
                    id="department"
                    type="text"
                    required={isRegisterMode}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    placeholder={t('fields.department')}
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            {!isRegisterMode && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  {t('login.email')}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder={t('login.email')}
                  disabled={isLoading}
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                {t('login.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder={t('login.password')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {isRegisterMode && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                  {t('login.confirmPassword')}
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required={isRegisterMode}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder={t('login.confirmPassword')}
                  disabled={isLoading}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email || !password || (isRegisterMode && (!firstName || !lastName || !username || !department || !confirmPassword))}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isRegisterMode ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                isRegisterMode ? 'Create Account' : 'Sign in'
              )}
            </button>
          </form>

        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2024 IT Management Suite. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
