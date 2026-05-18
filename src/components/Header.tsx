import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Menu, Search } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import LanguageSelector from './LanguageSelector';
import BrandLogo from './brand/BrandLogo';

interface HeaderProps {
  onMenuClick: () => void;
  user: {
    firstName?: string;
    lastName?: string;
    role?: string;
  } | null;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, user }) => {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-4 bg-background/80 px-5 backdrop-blur-md lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl p-2.5 text-muted-foreground transition hover:bg-white hover:shadow-cloud lg:hidden"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <BrandLogo variant="app-icon" className="h-9 w-9 shrink-0 lg:hidden" />

        <div className="relative hidden max-w-md flex-1 md:block">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cloud-muted" />
          <input
            type="search"
            placeholder={t('common.searchPlaceholder')}
            className="cloud-input pl-11"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <LanguageSelector />
        <NotificationDropdown />
        <div className="hidden h-8 w-px bg-border sm:block" />
        <div className="flex items-center gap-3 rounded-2xl bg-white px-2 py-1.5 shadow-cloud sm:px-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-cloud-navy">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-cloud-muted">
              {user?.role === 'admin' ? t('common.administrator') : t('common.user')}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-cloud-blue-light text-sm font-bold text-white shadow-md">
            {user?.firstName?.charAt(0)}
            {user?.lastName?.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
