import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PillTagProps {
  label: string;
  level?: number;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'stretch';
  onRemove?: () => void;
  className?: string;
}

export const PillTag: React.FC<PillTagProps> = ({
  label,
  level,
  variant = 'default',
  onRemove,
  className,
}) => {
  const variantStyles = {
    default: 'bg-surface-subtle text-text border-border',
    accent: 'bg-accent/10 text-accent border-accent/30',
    success: 'bg-success/10 text-success border-success/30',
    warning: 'bg-warning/10 text-warning border-warning/30',
    stretch: 'bg-accent/15 text-accent border-accent/40 font-semibold',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-sans border transition-colors',
          variantStyles[variant],
          className
        )
      )}
    >
      <span>{label}</span>
      {level !== undefined && (
        <span
          className="text-[10px] font-mono px-1.5 py-0.2 bg-surface/70 rounded-full border border-border/60 text-text-muted"
          title={`Proficiency Level: ${level}/5`}
        >
          L{level}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 hover:text-danger focus:outline-none"
          aria-label={`Remove ${label}`}
        >
          &times;
        </button>
      )}
    </span>
  );
};
