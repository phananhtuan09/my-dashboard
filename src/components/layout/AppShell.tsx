'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, CheckSquare, ListTodo, Clock, LayoutDashboard } from 'lucide-react';
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
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-blue-600">
            <LayoutDashboard className="w-6 h-6" />
            <span className="font-bold text-gray-900 text-lg tracking-tight">Work Planner</span>
          </div>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
               U
             </div>
             <div className="text-sm font-medium text-gray-900">User</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative min-w-0 overflow-y-auto pb-16 md:pb-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between h-14 bg-white border-b border-gray-200 px-4 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-blue-600">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-bold text-gray-900">Work Planner</span>
          </div>
        </header>
        
        {/* Content */}
        <div className="flex-1">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 z-20 flex px-2 sm:px-4 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 min-w-0",
                  isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-gray-400")} />
                <span className="text-[10px] sm:text-xs font-medium truncate w-full text-center px-1">
                  {isActive ? <strong className="font-semibold">{item.name}</strong> : item.name}
                </span>
              </Link>
            );
          })}
      </nav>
    </div>
  );
}
