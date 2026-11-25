import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PillTagProps {
  label: string;
  level?: number;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'stretch' | 'cyan' | 'pink';
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
    default: 'bg-white/[0.04] text-text-muted hover:text-text border-white/[0.08]',
    accent: 'bg-purple-500/10 text-purple-300 border-purple-500/25',
    cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25',
    pink: 'bg-pink-500/10 text-pink-300 border-pink-500/25',
    success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    warning: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    stretch: 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-purple-200 border-purple-500/30 font-semibold',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border backdrop-blur-sm transition-colors',
          variantStyles[variant],
          className
        )
      )}
    >
      <span>{label}</span>
      {level !== undefined && (
        <span
          className="text-[9px] font-mono px-1 py-0.2 bg-white/10 rounded border border-white/15 text-text"
          title={`Proficiency Level: ${level}/5`}
        >
          L{level}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="hover:text-danger text-text-muted transition-colors leading-none ml-0.5"
          aria-label={`Remove ${label}`}
        >
          &times;
        </button>
      )}
    </span>
  );
};
