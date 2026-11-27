import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  selected?: boolean;
}

export const Card: React.FC<CardProps> = ({
  interactive = false,
  selected = false,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-surface border rounded-card shadow-tactile transition-colors duration-fast',
          selected
            ? 'border-accent-border bg-[#19191d]'
            : 'border-border',
          interactive && !selected && 'hover:border-border-strong hover:bg-[#19191d] cursor-pointer',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
