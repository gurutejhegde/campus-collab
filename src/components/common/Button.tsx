import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'subtle' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
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
  const baseStyles =
    'inline-flex items-center justify-center font-medium font-sans rounded-pill transition-colors duration-smooth focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none select-none disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-accent hover:bg-accent-hover text-white shadow-none border border-transparent active:scale-[0.98]',
    secondary:
      'bg-surface hover:bg-surface-subtle text-text border border-border hover:border-text-muted/40 active:scale-[0.98]',
    subtle:
      'bg-transparent hover:bg-surface-subtle text-text-muted hover:text-text border border-transparent',
    danger:
      'bg-danger hover:opacity-90 text-white border border-transparent active:scale-[0.98]',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
