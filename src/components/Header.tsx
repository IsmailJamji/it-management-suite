import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Menu, Search } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import LanguageSelector from './LanguageSelector';

interface HeaderProps {
  onMenuClick: () => void;
  user: any;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, user }) => {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-6">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md hover:bg-accent lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="hidden lg:block">
          <h1 className="text-xl font-semibold">{t('app.title')}</h1>
        </div>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('common.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-2">
        {/* Language Selector */}
        <LanguageSelector />

        {/* Notifications */}
        <NotificationDropdown />

        {/* User info */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted-foreground">
              {user?.role === 'admin' ? t('common.administrator') : t('common.user')}
            </p>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
