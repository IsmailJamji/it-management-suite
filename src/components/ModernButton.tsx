import React from 'react';
import { clsx } from 'clsx';

interface ModernButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  className = '',
  type = 'button',
}) => {
  const sizeClasses = {
    sm: 'h-9 gap-1.5 px-4 text-xs',
    md: 'h-10 gap-2 px-5 text-sm',
    lg: 'h-11 gap-2.5 px-6 text-base',
  };

  const variantClasses = {
    primary:
      'bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90',
    secondary:
      'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline:
      'border border-border bg-white text-cloud-navy shadow-sm hover:bg-secondary/60',
    ghost: 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground',
    danger:
      'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
    success:
      'bg-cloud-green text-white shadow-md shadow-cloud-green/20 hover:brightness-105',
    warning:
      'bg-cloud-orange text-white shadow-md shadow-cloud-orange/20 hover:brightness-105',
    info:
      'bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center whitespace-nowrap rounded-full font-semibold',
        'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <>
          {icon && <span className="flex shrink-0 items-center justify-center">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export default ModernButton;
