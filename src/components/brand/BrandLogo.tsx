import React from 'react';

export type BrandLogoVariant =
  | 'app-icon'
  | 'brand-grid'
  | 'brand-brackets'
  | 'footer';

interface BrandLogoProps {
  variant: BrandLogoVariant;
  className?: string;
  showTagline?: boolean;
}

/** Palette CloudCash / thème application */
const PRIMARY = '#4318FF';
const PRIMARY_LIGHT = '#868CFF';
const PRIMARY_DEEP = '#5B4FFF';
const GREEN = '#05CD99';
const NAVY = '#1B2559';
const MUTED = '#A3AED0';

const AppIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
    <rect width="64" height="64" rx="14" fill={PRIMARY} />
    <rect x="10" y="10" width="20" height="20" rx="5" fill="white" />
    <rect x="34" y="10" width="20" height="20" rx="5" fill={PRIMARY_LIGHT} />
    <rect x="10" y="34" width="20" height="20" rx="5" fill={GREEN} />
    <rect x="34" y="34" width="20" height="20" rx="5" fill={PRIMARY_DEEP} />
    <text
      x="44"
      y="48"
      textAnchor="middle"
      fill="white"
      fontSize="11"
      fontWeight="700"
      fontFamily="DM Sans, system-ui, sans-serif"
    >
      IT
    </text>
  </svg>
);

const BrandGrid: React.FC<{ className?: string; showTagline?: boolean }> = ({
  className,
  showTagline = true,
}) => (
  <svg viewBox="0 0 220 48" fill="none" className={className} role="img" aria-label="IT Suite">
    <rect x="0" y="4" width="12" height="12" rx="3" fill={PRIMARY} />
    <rect x="14" y="4" width="12" height="12" rx="3" fill={PRIMARY} />
    <rect x="28" y="4" width="12" height="12" rx="3" fill={PRIMARY_LIGHT} />
    <rect x="0" y="18" width="12" height="12" rx="3" fill={GREEN} />
    <rect x="14" y="18" width="12" height="12" rx="3" fill={PRIMARY} />
    <rect x="28" y="18" width="12" height="12" rx="3" fill={GREEN} />
    <rect x="0" y="32" width="12" height="12" rx="3" fill={GREEN} />
    <rect x="14" y="32" width="12" height="12" rx="3" fill={PRIMARY_LIGHT} />
    <rect x="28" y="32" width="12" height="12" rx="3" fill={PRIMARY} />
    <text x="48" y="28" fill={PRIMARY} fontSize="22" fontWeight="700" fontFamily="DM Sans, system-ui, sans-serif">
      IT
    </text>
    <text x="72" y="28" fill={NAVY} fontSize="22" fontWeight="600" fontFamily="DM Sans, system-ui, sans-serif">
      SUITE
    </text>
    {showTagline && (
      <text
        x="48"
        y="44"
        fill={GREEN}
        fontSize="7"
        fontWeight="600"
        letterSpacing="0.14em"
        fontFamily="DM Sans, system-ui, sans-serif"
      >
        PROFESSIONAL TOOLKIT
      </text>
    )}
  </svg>
);

const BrandBrackets: React.FC<{ className?: string; showTagline?: boolean }> = ({
  className,
  showTagline = true,
}) => (
  <svg viewBox="0 0 200 48" fill="none" className={className} role="img" aria-label="IT Suite">
    <path
      d="M4 8 L4 40 Q4 44 8 44 L14 44"
      stroke={PRIMARY}
      strokeWidth="5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M26 8 L26 40 Q26 44 22 44 L16 44"
      stroke={GREEN}
      strokeWidth="5"
      strokeLinecap="round"
      fill="none"
    />
    <text x="36" y="30" fill={NAVY} fontSize="20" fontWeight="800" fontFamily="DM Sans, system-ui, sans-serif">
      IT
    </text>
    <text x="58" y="30" fill={NAVY} fontSize="20" fontWeight="500" fontFamily="DM Sans, system-ui, sans-serif">
      Suite
    </text>
    {showTagline && (
      <text
        x="36"
        y="44"
        fill={GREEN}
        fontSize="7"
        fontWeight="600"
        letterSpacing="0.14em"
        fontFamily="DM Sans, system-ui, sans-serif"
      >
        PROFESSIONAL TOOLKIT
      </text>
    )}
  </svg>
);

/** Footer aligné sur le thème (fond clair, accent violet/vert) */
const FooterBar: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 360 36" fill="none" className={className} role="img" aria-label="IT Suite Professional Toolkit">
    <rect width="360" height="36" rx="10" fill="white" stroke="#E9EDF7" strokeWidth="1" />
    <rect x="0" y="0" width="4" height="36" rx="10" fill={PRIMARY} />
    <text x="16" y="23" fill={NAVY} fontSize="13" fontWeight="700" fontFamily="DM Sans, system-ui, sans-serif">
      IT SUITE
    </text>
    <line x1="92" y1="10" x2="92" y2="26" stroke="#E9EDF7" strokeWidth="1" />
    <text x="102" y="23" fill={GREEN} fontSize="11" fontWeight="600" fontFamily="DM Sans, system-ui, sans-serif">
      Professional Toolkit
    </text>
  </svg>
);

const BrandLogo: React.FC<BrandLogoProps> = ({ variant, className = '', showTagline = true }) => {
  switch (variant) {
    case 'app-icon':
      return <AppIcon className={className} />;
    case 'brand-grid':
      return <BrandGrid className={className} showTagline={showTagline} />;
    case 'brand-brackets':
      return <BrandBrackets className={className} showTagline={showTagline} />;
    case 'footer':
      return <FooterBar className={className} />;
    default:
      return <AppIcon className={className} />;
  }
};

export default BrandLogo;
