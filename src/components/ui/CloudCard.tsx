import React from 'react';
import { clsx } from 'clsx';

interface CloudCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const CloudCard: React.FC<CloudCardProps> = ({
  children,
  className,
  padding = 'md',
  hover = false,
}) => (
  <div
    className={clsx(
      'cloud-card',
      paddingMap[padding],
      hover && 'cloud-card-hover',
      className
    )}
  >
    {children}
  </div>
);

export default CloudCard;
