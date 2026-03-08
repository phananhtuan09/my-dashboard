import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'info' | 'secondary';
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none',
        {
          'border-transparent bg-gray-900 text-slate-50': variant === 'default',
          'border-transparent bg-green-100 text-green-700':
            variant === 'success',
          'border-transparent bg-amber-100 text-amber-700':
            variant === 'warning',
          'border-transparent bg-blue-100 text-blue-700': variant === 'info',
          'border-transparent bg-gray-100 text-gray-700':
            variant === 'secondary',
        },
        className
      )}
      {...props}
    />
  );
}
