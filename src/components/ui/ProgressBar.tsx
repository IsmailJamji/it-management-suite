import React from 'react';
import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  showValue?: boolean;
  className?: string;
}

const colorMap = {
  blue: 'bg-cloud-blue',
  green: 'bg-cloud-green',
  orange: 'bg-cloud-orange',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  color = 'blue',
  showValue = true,
  className,
}) => {
  const pct = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={clsx('space-y-2', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium text-foreground/80">{label}</span>}
          {showValue && (
            <span className="font-semibold text-foreground">{pct}%</span>
          )}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={clsx('h-full rounded-full transition-all duration-500', colorMap[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
