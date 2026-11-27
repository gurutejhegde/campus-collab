import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'subtle' | 'danger';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className,
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center rounded-control font-medium transition-all duration-fast select-none disabled:opacity-45 disabled:cursor-not-allowed active:scale-[0.98]';

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-[13px] px-3.5 py-2 gap-2',
  };

  const variants = {
    primary: 'bg-accent hover:bg-accent-hover text-white border border-accent-border',
    ghost: 'bg-surface hover:bg-surface-elevated text-text border border-border hover:border-border-strong',
    subtle: 'bg-transparent hover:bg-surface-elevated text-text-muted hover:text-text border border-transparent',
    danger: 'bg-danger/90 hover:bg-danger text-white border border-transparent',
  };

  return (
    <button
      className={twMerge(clsx(base, sizes[size], variants[variant], className))}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
