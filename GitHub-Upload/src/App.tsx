import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LanguageProvider } from './contexts/LanguageContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import DevicesPage from './pages/DevicesPage';
import ITAssetsPage from './pages/ITAssetsPage';
import TelecomAssetsPage from './pages/TelecomAssetsPage';
import TasksPage from './pages/TasksPage';
import ProjectsPage from './pages/ProjectsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import SystemInfoPage from './pages/SystemInfoPage';
import AIPage from './pages/AIPage';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import InstallationWizard from './components/InstallationWizard';
import { toast } from 'react-hot-toast';

function AppRoutes() {
  const { user, loading } = useAuth();
  const [showInstallationWizard, setShowInstallationWizard] = useState(false);
  const [installationLoading, setInstallationLoading] = useState(true);

  useEffect(() => {
    checkInstallationStatus();
  }, []);

  const checkInstallationStatus = async () => {
    try {
      if (window.electronAPI && window.electronAPI.installation) {
        const config = await window.electronAPI.installation.getConfig();
        console.log('Installation config check:', config);
        if (!config) {
          console.log('No config found, auto-configuring Local mode');
          try {
            await window.electronAPI.installation.setMode('local');
            console.log('Auto Local mode configured');
          } catch (e) {
            console.log('Auto-config failed, showing installation wizard');
            setShowInstallationWizard(true);
          }
        } else {
          console.log('Config found, skipping installation wizard');
        }
      } else {
        // In development mode, skip installation wizard
        console.log('Electron API not available, skipping installation wizard');
      }
    } catch (error) {
      console.error('Failed to check installation status:', error);
      // Show wizard if we're in production mode and there's an error
      if (window.electronAPI && window.electronAPI.installation) {
        console.log('Error checking config, showing installation wizard');
        setShowInstallationWizard(true);
      }
    } finally {
      setInstallationLoading(false);
    }
  };

  const handleInstallationComplete = async (mode: 'server' | 'client' | 'local', serverInfo?: { name: string; ip: string }) => {
    try {
      if (window.electronAPI && window.electronAPI.installation) {
        await window.electronAPI.installation.setMode(mode, serverInfo);
      } else {
        console.log('Electron API not available, skipping installation configuration');
      }
      setShowInstallationWizard(false);
      toast.success('Installation completed successfully!');
    } catch (error) {
      console.error('Installation failed:', error);
      toast.error('Installation failed. Please try again.');
    }
  };

  const handleInstallationCancel = () => {
    setShowInstallationWizard(false);
  };

  if (loading || installationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (showInstallationWizard) {
    return (
      <InstallationWizard
        onModeSelected={handleInstallationComplete}
        onCancel={handleInstallationCancel}
      />
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/devices" element={<DevicesPage />} />
        <Route path="/it-assets" element={<ITAssetsPage />} />
        <Route path="/telecom-assets" element={<TelecomAssetsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/system" element={<SystemInfoPage />} />
        <Route path="/ai" element={<AIPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize app
    const initApp = async () => {
      try {
        // Set up menu event listeners
        if (window.electronAPI) {
          window.electronAPI.onMenuEvent((event: string) => {
            switch (event) {
              case 'menu-new-project':
                toast.success('New Project menu clicked');
                break;
              case 'menu-new-task':
                toast.success('New Task menu clicked');
                break;
              case 'menu-add-device':
                toast.success('Add Device menu clicked');
                break;
              case 'menu-export-data':
                toast.success('Export Data menu clicked');
                break;
              case 'menu-system-info':
                toast.success('System Info menu clicked');
                break;
              case 'menu-ai-assistant':
                toast.success('AI Assistant menu clicked');
                break;
              case 'menu-device-scan':
                toast.success('Device Scan menu clicked');
                break;
              default:
                break;
            }
          });
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        toast.error('Failed to initialize application');
        setIsInitialized(true);
      }
    };

    initApp();

    // Cleanup
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners();
      }
    };
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
