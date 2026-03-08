import { cn } from '@/lib/utils';
import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
            'border border-gray-200 bg-white text-gray-900 hover:bg-slate-50':
              variant === 'secondary',
            'bg-transparent text-gray-500 hover:bg-slate-50 hover:text-gray-900':
              variant === 'ghost',
            'bg-amber-500 text-white hover:bg-amber-600': variant === 'danger',
            'h-8 px-3 text-[13px]': size === 'sm',
            'h-9 px-4 py-2 text-sm': size === 'md',
            'h-11 px-8 py-3 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
