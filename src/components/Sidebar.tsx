import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import ModernIcon from './ModernIcon';
import { X } from 'lucide-react';

interface SidebarProps {
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user, logout, isAdmin, hasPermission } = useAuth();
  const { t } = useLanguage();

  const getNavigationItems = () => {
    const baseNavigation = [
      { name: t('sidebar.dashboard'), href: '/', icon: 'dashboard', permission: 'view_dashboard' },
      { name: t('sidebar.tasks'), href: '/tasks', icon: 'tasks', permission: 'view_tasks' },
      { name: t('sidebar.projects'), href: '/projects', icon: 'projects', permission: 'view_projects' },
      { name: t('sidebar.system'), href: '/system', icon: 'system', permission: 'view_system_info' },
    ];

    const adminOnlyNavigation = [
      { name: t('sidebar.devices'), href: '/devices', icon: 'devices', permission: 'view_devices' },
      { name: t('sidebar.itAssets'), href: '/it-assets', icon: 'itAssets', permission: 'view_it_assets' },
      { name: t('sidebar.telecomAssets'), href: '/telecom-assets', icon: 'telecomAssets', permission: 'view_telecom_assets' },
      { name: t('sidebar.users'), href: '/users', icon: 'users', permission: 'view_users' },
      { name: t('sidebar.settings'), href: '/settings', icon: 'settings', permission: 'view_users' }
    ];

    // Filter navigation based on user permissions (admin has all)
    const canSee = (perm?: string) => {
      if (!perm) return true;
      if (user?.role === 'admin') return true;
      return hasPermission(perm);
    };

    const filteredNavigation = baseNavigation.filter(item => canSee(item.permission));
    const filteredAdminNavigation = adminOnlyNavigation.filter(item => canSee(item.permission));

    return [...filteredNavigation, ...filteredAdminNavigation];
  };

  const navigation = getNavigationItems();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-full flex-col bg-card border-r">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-6">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <ModernIcon name="monitor" size={20} className="text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">{t('app.title')}</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md hover:bg-accent"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                }`
              }
              onClick={onClose}
            >
              <ModernIcon name={item.icon} size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

      </nav>

      {/* User info and logout */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.role === 'admin' ? t('users.admin') : t('users.user')}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <ModernIcon name="logout" size={20} />
          <span>{t('sidebar.logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
