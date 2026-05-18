import React from 'react';
import {
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  Monitor,
  Laptop,
  Smartphone,
  Users,
  Cpu,
  Settings,
  LogOut,
  Server,
  Wifi,
  Sparkles,
  HardDrive,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';

interface ModernIconProps {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const ICON_MAP: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  tasks: ListTodo,
  projects: FolderKanban,
  devices: Monitor,
  itAssets: HardDrive,
  telecomAssets: Smartphone,
  users: Users,
  system: Cpu,
  settings: Settings,
  logout: LogOut,
  monitor: Monitor,
  laptop: Laptop,
  server: Server,
  wifi: Wifi,
  ai: Sparkles,
  default: HelpCircle,
};

const PROVIDER_ICONS = new Set(['inwi', 'orange', 'iam']);

const ModernIcon: React.FC<ModernIconProps> = ({
  name,
  size = 20,
  className = '',
  strokeWidth = 2,
}) => {
  if (PROVIDER_ICONS.has(name)) {
    return (
      <img
        src={`/${name}-logo.png`}
        alt={name.toUpperCase()}
        width={size}
        height={size}
        className={`shrink-0 object-contain ${className}`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  const Icon = ICON_MAP[name] || ICON_MAP.default;

  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      className={`shrink-0 ${className}`}
      aria-hidden
    />
  );
};

export default ModernIcon;
