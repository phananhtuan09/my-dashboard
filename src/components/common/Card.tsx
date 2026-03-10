import { cn } from '@/lib/utils';
import React from 'react';

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[rgba(148,163,184,0.2)] bg-white text-slate-900 frost-shadow frost-shadow-hover transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1 p-6 border-b border-[rgba(148,163,184,0.12)]', className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-section leading-none tracking-tight font-bold text-slate-900', className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-5 text-sm', className)} {...props} />;
}
