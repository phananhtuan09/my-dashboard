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
          'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:outline-none disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold shadow-[0_1px_2px_rgba(37,99,235,0.3),_0_4px_12px_rgba(37,99,235,0.2)] hover:from-blue-700 hover:to-blue-800 hover:-translate-y-px hover:shadow-[0_4px_8px_rgba(37,99,235,0.4),_0_8px_16px_rgba(37,99,235,0.3)] active:translate-y-0 active:shadow-sm': variant === 'primary',
            'bg-white/80 border border-[rgba(148,163,184,0.3)] text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.05)] hover:bg-white hover:border-[rgba(37,99,235,0.3)] hover:text-blue-700':
              variant === 'secondary',
            'bg-transparent text-slate-500 hover:bg-slate-400/10 hover:text-slate-900':
              variant === 'ghost',
            'bg-red-600 text-white shadow-[0_2px_8px_rgba(220,38,38,0.2)] hover:bg-red-700': variant === 'danger',
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
