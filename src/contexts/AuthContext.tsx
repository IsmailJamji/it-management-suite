import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  firstName: string;
  lastName: string;
  department: string;
  isActive: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  permissions: string[];
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: { username: string; password: string; firstName: string; lastName: string; email: string; department: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  hasPermission: (permission: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        if (window.electronAPI) {
          const currentUser = await window.electronAPI.auth.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            try {
              const perms = await window.electronAPI.permissions.getByUser(currentUser.id);
              setPermissions(perms || []);
            } catch (_) {}
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      if (!window.electronAPI) {
        // For development/testing without Electron
        if (email === 'admin@itmanagement.com' && password === 'admin123') {
          const mockUser = {
            id: 1,
            username: 'admin',
            email: 'admin@itmanagement.com',
            role: 'admin' as const,
            firstName: 'System',
            lastName: 'Administrator',
            department: 'IT',
            isActive: true,
            createdAt: new Date().toISOString()
          };
          setUser(mockUser);
          toast.success(`Welcome back, ${mockUser.firstName}!`);
          return true;
        } else if (email === 'user@company.com' && password === 'user123') {
          const mockUser = {
            id: 2,
            username: 'user',
            email: 'user@company.com',
            role: 'user' as const,
            firstName: 'Regular',
            lastName: 'User',
            department: 'IT',
            isActive: true,
            createdAt: new Date().toISOString()
          };
          setUser(mockUser);
          toast.success(`Welcome back, ${mockUser.firstName}!`);
          return true;
        } else {
          toast.error('Invalid username or password');
          return false;
        }
      }

      const result = await window.electronAPI.auth.login({ email, password });
      
      if (result.success && result.user) {
        setUser(result.user);
        try {
          const perms = await window.electronAPI.permissions.getByUser(result.user.id);
          setPermissions(perms || []);
        } catch (_) {}
        toast.success(`Welcome back, ${result.user.firstName}!`);
        return true;
      } else {
        toast.error(result.message || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: { username: string; password: string; firstName: string; lastName: string; email: string; department: string }): Promise<boolean> => {
    try {
      setLoading(true);
      
      if (!window.electronAPI) {
        // For development/testing without Electron
        const mockUser = {
          id: Date.now(),
          username: userData.username,
          email: userData.email,
          role: 'user' as const,
          firstName: userData.firstName,
          lastName: userData.lastName,
          department: userData.department,
          isActive: true,
          createdAt: new Date().toISOString()
        };
        setUser(mockUser);
        toast.success(`Account created successfully! Welcome, ${mockUser.firstName}!`);
        return true;
      }

      const result = await window.electronAPI.auth.register(userData);
      
      if (result.success && result.user) {
        setUser(result.user);
        try {
          const perms = await window.electronAPI.permissions.getByUser(result.user.id);
          setPermissions(perms || []);
        } catch (_) {}
        toast.success(`Account created successfully! Welcome, ${result.user.firstName}!`);
        return true;
      } else {
        toast.error(result.message || 'Registration failed. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.auth.logout();
      }
      setUser(null);
      setPermissions([]);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred during logout');
    }
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return permissions.includes(permission);
  };

  const refreshPermissions = async (): Promise<void> => {
    if (!user || !window.electronAPI) return;
    try {
      const perms = await window.electronAPI.permissions.getByUser(user.id);
      setPermissions(perms || []);
    } catch (error) {
      console.error('Failed to refresh permissions:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    permissions,
    login,
    register,
    logout,
    isAdmin,
    hasPermission,
    refreshPermissions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
