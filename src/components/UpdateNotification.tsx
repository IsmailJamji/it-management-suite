import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Download, RefreshCw, X } from 'lucide-react';

const UpdateNotification: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if ((window.electronAPI as any)?.updater) {
      // Listen for update events
      (window.electronAPI as any).updater.onUpdateAvailable(() => {
        setUpdateAvailable(true);
        toast.success('Update available! Downloading...');
      });

      (window.electronAPI as any).updater.onUpdateDownloaded(() => {
        setUpdateDownloaded(true);
        setUpdateAvailable(false);
        toast.success('Update downloaded! Restart to install.');
      });

      (window.electronAPI as any).updater.onUpdateError((error: string) => {
        toast.error(`Update error: ${error}`);
        setIsChecking(false);
      });
    }
  }, []);

  const checkForUpdates = async () => {
    if (!(window.electronAPI as any)?.updater) return;
    
    setIsChecking(true);
    try {
      await (window.electronAPI as any).updater.checkForUpdates();
    } catch (error) {
      toast.error('Failed to check for updates');
    } finally {
      setIsChecking(false);
    }
  };

  const installUpdate = async () => {
    if (!(window.electronAPI as any)?.updater) return;
    
    try {
      await (window.electronAPI as any).updater.quitAndInstall();
    } catch (error) {
      toast.error('Failed to install update');
    }
  };

  const dismissNotification = () => {
    setUpdateAvailable(false);
    setUpdateDownloaded(false);
  };

  if (!updateAvailable && !updateDownloaded) {
    return (
      <button
        onClick={checkForUpdates}
        disabled={isChecking}
        className="flex items-center space-x-2 px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        title="Check for updates"
      >
        <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
        <span>{isChecking ? 'Checking...' : 'Check Updates'}</span>
      </button>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-background border border-border rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {updateDownloaded ? (
              <Download className="w-5 h-5 text-green-500" />
            ) : (
              <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-foreground">
              {updateDownloaded ? 'Update Ready' : 'Update Available'}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {updateDownloaded 
                ? 'Restart the application to install the update.'
                : 'A new version is being downloaded...'
              }
            </p>
          </div>
        </div>
        <button
          onClick={dismissNotification}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {updateDownloaded && (
        <div className="mt-3 flex space-x-2">
          <button
            onClick={installUpdate}
            className="flex-1 bg-primary text-primary-foreground px-3 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Restart & Install
          </button>
          <button
            onClick={dismissNotification}
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Later
          </button>
        </div>
      )}
    </div>
  );
};

export default UpdateNotification;
