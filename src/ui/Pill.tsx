import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PillProps {
  children: React.ReactNode;
  variant?: 'default' | 'strong' | 'burgundy' | 'ok';
  className?: string;
}

export const Pill: React.FC<PillProps> = ({
  children,
  variant = 'default',
  className,
}) => {
  const variants = {
    default: 'bg-well text-text-muted border-border',
    strong: 'bg-well text-text border-border-strong',
    burgundy: 'bg-accent-soft text-accent-text border-accent-border',
    ok: 'bg-ok-soft text-ok border-ok/30',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11.5px] border font-medium',
          variants[variant],
          className
        )
      )}
    >
      {children}
    </span>
  );
};
