'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, CheckSquare, ListTodo, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { name: 'Weekly Schedule', href: '/schedule', icon: CalendarDays },
  { name: 'Daily Checklist', href: '/daily', icon: CheckSquare },
  { name: 'Task Manager', href: '/tasks', icon: ListTodo },
  { name: 'Time Slots', href: '/time-slots', icon: Clock },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100">
      {/* Desktop Sidebar — blue-tinted glass */}
      <aside
        className="hidden md:flex flex-col w-60 shrink-0 border-r border-[rgba(148,163,184,0.25)] z-10 shadow-[2px_0_12px_rgba(37,99,235,0.08)]"
        style={{ background: 'linear-gradient(180deg, #DBEAFE 0%, #EEF2FF 100%)' }}
      >
        <div className="h-14 flex items-center px-5 border-b border-[rgba(148,163,184,0.15)]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 shadow-[0_2px_8px_rgba(37,99,235,0.3)] flex items-center justify-center shrink-0">
              <div className="w-2.5 h-2.5 rounded-sm bg-white/90" />
            </div>
            <span className="font-semibold text-slate-900 tracking-tight">Work Planner</span>
          </div>
        </div>

        <nav className="flex-1 py-3 px-2.5 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                  isActive
                    ? 'bg-white/70 text-blue-700 font-semibold border-l-[3px] border-blue-600 rounded-l-none shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40 font-medium border-l-[3px] border-transparent'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0',
                    isActive ? 'text-blue-600' : 'text-slate-400'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative min-w-0 overflow-y-auto pb-16 md:pb-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center h-14 bg-white border-b border-[rgba(148,163,184,0.2)] px-4 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 shadow-[0_2px_8px_rgba(37,99,235,0.3)] flex items-center justify-center shrink-0">
              <div className="w-2.5 h-2.5 rounded-sm bg-white/90" />
            </div>
            <span className="font-semibold text-slate-900 tracking-tight">Work Planner</span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 px-6 py-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[rgba(148,163,184,0.2)] z-20 flex px-1 pb-safe shadow-[0_-2px_8px_rgba(15,23,42,0.06)]">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 min-w-0',
                isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span
                className={cn(
                  'text-[10px] truncate w-full text-center px-0.5',
                  isActive ? 'font-semibold' : 'font-medium'
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
