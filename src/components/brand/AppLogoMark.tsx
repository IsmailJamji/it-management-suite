import React from 'react';
import BrandLogo from './BrandLogo';

type AppLogoMarkSize = 'sm' | 'md' | 'lg';

interface AppLogoMarkProps {
  size?: AppLogoMarkSize;
  className?: string;
}

const sizes = {
  sm: { box: 'h-10 w-10 rounded-xl', icon: 'h-7 w-7', glow: 'rounded-xl -inset-0.5' },
  md: { box: 'h-[72px] w-[72px] rounded-[20px]', icon: 'h-12 w-12', glow: 'rounded-[22px] -inset-1' },
  lg: { box: 'h-20 w-20 rounded-[22px]', icon: 'h-[52px] w-[52px]', glow: 'rounded-[24px] -inset-1.5' },
};

/** Icône app seule, style thème CloudCash */
const AppLogoMark: React.FC<AppLogoMarkProps> = ({ size = 'md', className = '' }) => {
  const s = sizes[size];

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        className={`absolute ${s.glow} opacity-50 blur-md`}
        style={{
          background: 'linear-gradient(135deg, #4318FF 0%, #868CFF 55%, #05CD99 100%)',
        }}
        aria-hidden
      />
      <div
        className={`relative flex items-center justify-center bg-gradient-to-br from-primary via-[#5B4FFF] to-cloud-blue-light shadow-cloud-lg ring-2 ring-white/90 ${s.box}`}
      >
        <BrandLogo variant="app-icon" className={s.icon} />
      </div>
    </div>
  );
};

export default AppLogoMark;
