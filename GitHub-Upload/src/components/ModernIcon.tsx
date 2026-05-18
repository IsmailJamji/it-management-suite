import React from 'react';

interface ModernIconProps {
  name: string;
  size?: number;
  className?: string;
}

const ModernIcon: React.FC<ModernIconProps> = ({ name, size = 24, className = '' }) => {
  const iconStyle = {
    width: size,
    height: size,
  };

  const icons: { [key: string]: JSX.Element } = {
    // Navigation Icons
    dashboard: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="3" y="3" width="7" height="7" rx="1" fill="#3B82F6" />
        <rect x="14" y="3" width="7" height="7" rx="1" fill="#10B981" />
        <rect x="3" y="14" width="7" height="7" rx="1" fill="#F59E0B" />
        <rect x="14" y="14" width="7" height="7" rx="1" fill="#EF4444" />
      </svg>
    ),
    tasks: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M9 12l2 2 4-4" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="#10B981" strokeWidth="2" />
        <circle cx="12" cy="12" r="3" fill="#10B981" />
      </svg>
    ),
    projects: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" fill="#8B5CF6" />
        <path d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" fill="#A78BFA" />
        <rect x="6" y="11" width="3" height="2" rx="1" fill="white" />
        <rect x="6" y="15" width="5" height="2" rx="1" fill="white" />
      </svg>
    ),
    devices: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="2" y="4" width="20" height="14" rx="2" fill="#3B82F6" />
        <rect x="4" y="6" width="16" height="10" rx="1" fill="#1E40AF" />
        <circle cx="8" cy="8" r="1" fill="#60A5FA" />
        <rect x="10" y="7" width="6" height="2" rx="1" fill="#60A5FA" />
        <rect x="10" y="10" width="4" height="1" rx="0.5" fill="#60A5FA" />
        <rect x="10" y="12" width="6" height="1" rx="0.5" fill="#60A5FA" />
        <rect x="10" y="14" width="3" height="1" rx="0.5" fill="#60A5FA" />
      </svg>
    ),
    itAssets: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="2" y="3" width="20" height="14" rx="2" fill="#3B82F6" />
        <rect x="4" y="5" width="16" height="10" rx="1" fill="#1E40AF" />
        <circle cx="8" cy="8" r="1" fill="#60A5FA" />
        <rect x="10" y="7" width="6" height="2" rx="1" fill="#60A5FA" />
        <rect x="10" y="10" width="4" height="1" rx="0.5" fill="#60A5FA" />
        <rect x="10" y="12" width="6" height="1" rx="0.5" fill="#60A5FA" />
        <rect x="10" y="14" width="3" height="1" rx="0.5" fill="#60A5FA" />
        <path d="M6 19h12" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
        <circle cx="6" cy="19" r="1" fill="#3B82F6" />
        <circle cx="18" cy="19" r="1" fill="#3B82F6" />
        <rect x="8" y="17" width="8" height="2" rx="1" fill="#3B82F6" />
      </svg>
    ),
    telecomAssets: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="5" y="2" width="14" height="20" rx="2" fill="#10B981" />
        <rect x="7" y="4" width="10" height="16" rx="1" fill="#34D399" />
        <circle cx="12" cy="8" r="2" fill="#6EE7B7" />
        <rect x="9" y="12" width="6" height="2" rx="1" fill="#6EE7B7" />
        <rect x="9" y="15" width="6" height="1" rx="0.5" fill="#6EE7B7" />
        <rect x="9" y="17" width="4" height="1" rx="0.5" fill="#6EE7B7" />
        <rect x="9" y="19" width="6" height="1" rx="0.5" fill="#6EE7B7" />
        <path d="M8 22h8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
        <circle cx="8" cy="22" r="1" fill="#10B981" />
        <circle cx="16" cy="22" r="1" fill="#10B981" />
      </svg>
    ),
    users: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="9" cy="7" r="4" fill="#10B981" />
        <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
        <circle cx="17" cy="7" r="4" fill="#34D399" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#34D399" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    system: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="2" y="3" width="20" height="14" rx="2" fill="#6366F1" />
        <rect x="4" y="5" width="16" height="10" rx="1" fill="#4F46E5" />
        <circle cx="8" cy="8" r="1" fill="#A5B4FC" />
        <rect x="10" y="7" width="6" height="2" rx="1" fill="#A5B4FC" />
        <rect x="10" y="10" width="4" height="1" rx="0.5" fill="#A5B4FC" />
        <rect x="10" y="12" width="6" height="1" rx="0.5" fill="#A5B4FC" />
        <rect x="10" y="14" width="3" height="1" rx="0.5" fill="#A5B4FC" />
        <path d="M6 19h12" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
        <circle cx="6" cy="19" r="1" fill="#6366F1" />
        <circle cx="18" cy="19" r="1" fill="#6366F1" />
      </svg>
    ),
    ai: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="10" fill="#8B5CF6" />
        <path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3" fill="white" />
        <path d="M9 9l3 3 3-3" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    settings: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="3" fill="#6B7280" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    logout: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="16,17 21,12 16,7" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="21" y1="12" x2="9" y2="12" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    // App Icons
    monitor: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="2" y="3" width="20" height="14" rx="2" fill="#3B82F6" />
        <rect x="4" y="5" width="16" height="10" rx="1" fill="#1E40AF" />
        <circle cx="8" cy="8" r="1" fill="#60A5FA" />
        <rect x="10" y="7" width="6" height="2" rx="1" fill="#60A5FA" />
        <rect x="10" y="10" width="4" height="1" rx="0.5" fill="#60A5FA" />
        <rect x="10" y="12" width="6" height="1" rx="0.5" fill="#60A5FA" />
        <rect x="10" y="14" width="3" height="1" rx="0.5" fill="#60A5FA" />
        <path d="M6 19h12" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
        <circle cx="6" cy="19" r="1" fill="#3B82F6" />
        <circle cx="18" cy="19" r="1" fill="#3B82F6" />
      </svg>
    ),
    // Mode Icons
    server: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="2" y="3" width="20" height="8" rx="2" fill="#8B5CF6" />
        <rect x="4" y="5" width="16" height="4" rx="1" fill="#A78BFA" />
        <circle cx="7" cy="7" r="1" fill="#C4B5FD" />
        <rect x="9" y="6" width="6" height="2" rx="1" fill="#C4B5FD" />
        <rect x="9" y="9" width="4" height="1" rx="0.5" fill="#C4B5FD" />
        <rect x="2" y="13" width="20" height="8" rx="2" fill="#8B5CF6" />
        <rect x="4" y="15" width="16" height="4" rx="1" fill="#A78BFA" />
        <circle cx="7" cy="17" r="1" fill="#C4B5FD" />
        <rect x="9" y="16" width="6" height="2" rx="1" fill="#C4B5FD" />
        <rect x="9" y="19" width="4" height="1" rx="0.5" fill="#C4B5FD" />
      </svg>
    ),
    laptop: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="2" y="3" width="20" height="14" rx="2" fill="#3B82F6" />
        <rect x="4" y="5" width="16" height="10" rx="1" fill="#1E40AF" />
        <circle cx="8" cy="8" r="1" fill="#60A5FA" />
        <rect x="10" y="7" width="6" height="2" rx="1" fill="#60A5FA" />
        <rect x="10" y="10" width="4" height="1" rx="0.5" fill="#60A5FA" />
        <rect x="10" y="12" width="6" height="1" rx="0.5" fill="#60A5FA" />
        <rect x="10" y="14" width="3" height="1" rx="0.5" fill="#60A5FA" />
        <path d="M6 19h12" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
        <circle cx="6" cy="19" r="1" fill="#3B82F6" />
        <circle cx="18" cy="19" r="1" fill="#3B82F6" />
      </svg>
    ),
    wifi: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M5 12.55a11 11 0 0114.08 0" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1.42 9a16 16 0 0121.16 0" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.53 16.11a6 6 0 016.95 0" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="12" y1="20" x2="12.01" y2="20" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    // Telecom Provider Logos - Real Company Logos
    inwi: (
      <img 
        src="/inwi-logo.png" 
        alt="INWI" 
        style={{ 
          width: size || 24, 
          height: size || 24, 
          objectFit: 'contain' 
        }} 
        className={className}
        onError={(e) => {
          // Fallback to colored circle if image fails to load
          e.currentTarget.style.display = 'none';
          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
          if (nextElement) {
            nextElement.style.setProperty('display', 'block');
          }
        }}
      />
    ),
    orange: (
      <img 
        src="/orange-logo.png" 
        alt="Orange" 
        style={{ 
          width: size || 24, 
          height: size || 24, 
          objectFit: 'contain' 
        }} 
        className={className}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
          if (nextElement) {
            nextElement.style.setProperty('display', 'block');
          }
        }}
      />
    ),
    iam: (
      <img 
        src="/iam-logo.png" 
        alt="IAM" 
        style={{ 
          width: size || 24, 
          height: size || 24, 
          objectFit: 'contain' 
        }} 
        className={className}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
          if (nextElement) {
            nextElement.style.setProperty('display', 'block');
          }
        }}
      />
    ),
    // Default fallback
    default: (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="10" fill="#6B7280" />
        <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  };

  return icons[name] || icons.default;
};

export default ModernIcon;
