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
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-[0.06em] transition-colors',
        {
          'bg-slate-900 text-white tracking-wide': variant === 'default',
          'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/80':
            variant === 'success',
          'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200/80':
            variant === 'warning',
          'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200/80': variant === 'info',
          'bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200/80':
            variant === 'secondary',
        },
        className
      )}
      {...props}
    />
  );
}
