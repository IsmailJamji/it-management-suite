import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import ModernIcon from './ModernIcon';
import AppLogoMark from './brand/AppLogoMark';
import { X } from 'lucide-react';

interface SidebarProps {
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user, logout, hasPermission } = useAuth();
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
      { name: t('sidebar.settings'), href: '/settings', icon: 'settings', permission: 'view_users' },
    ];

    const canSee = (perm?: string) => {
      if (!perm) return true;
      if (user?.role === 'admin') return true;
      return hasPermission(perm);
    };

    const filteredNavigation = baseNavigation.filter((item) => canSee(item.permission));
    const filteredAdminNavigation = adminOnlyNavigation.filter((item) => canSee(item.permission));

    return [...filteredNavigation, ...filteredAdminNavigation];
  };

  const navigation = getNavigationItems();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-full flex-col cloud-sidebar">
      <div className="flex h-[72px] items-center justify-between px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <AppLogoMark size="sm" />
          <span className="truncate text-lg font-bold tracking-tight text-cloud-navy">
            IT<span className="font-extrabold text-primary">Suite</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-muted-foreground hover:bg-white/80 lg:hidden"
          aria-label="Fermer le menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-2">
        <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-cloud-muted">
          {t('sidebar.menuLabel')}
        </p>
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              isActive ? 'cloud-nav-item cloud-nav-active' : 'cloud-nav-item'
            }
            onClick={onClose}
          >
            <span className="cloud-nav-icon">
              <ModernIcon name={item.icon} size={20} strokeWidth={2} />
            </span>
            <span className="truncate">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border/60 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/60 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
            {user?.firstName?.charAt(0)}
            {user?.lastName?.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-cloud-navy">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.role === 'admin' ? t('users.admin') : t('users.user')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="cloud-nav-item w-full text-left"
        >
          <span className="cloud-nav-icon">
            <ModernIcon name="logout" size={20} strokeWidth={2} className="text-destructive" />
          </span>
          <span>{t('sidebar.logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
