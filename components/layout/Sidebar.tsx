'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, CalendarDays, CheckSquare, Brain,
  Mail, FileText, ShoppingCart, Settings,
} from 'lucide-react';
import { useUiStore, useSyncStore } from '@/store';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/today',      label: 'Today',      icon: Home },
  { href: '/calendar',   label: 'Calendar',   icon: CalendarDays },
  { href: '/tasks',      label: 'Tasks',      icon: CheckSquare },
  { href: '/brainstorm', label: 'Brainstorm', icon: Brain },
  { href: '/email',      label: 'Email',      icon: Mail },
  { href: '/workspace',  label: 'Workspace',  icon: FileText },
  { href: '/grocery',    label: 'Grocery',    icon: ShoppingCart },
] as const;

const MOBILE_NAV_ITEMS = NAV_ITEMS.slice(0, 5);

function SyncDot() {
  const status = useSyncStore((s) => s.status);
  return (
    <span
      title={`Sync: ${status}`}
      className={cn(
        'h-2 w-2 rounded-full flex-shrink-0',
        status === 'idle'    && 'bg-green-500',
        status === 'syncing' && 'bg-yellow-400 animate-pulse',
        status === 'error'   && 'bg-red-500',
      )}
    />
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);

  return (
    <>
      {/* Desktop / Tablet sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col fixed left-0 top-0 h-full bg-zinc-900 border-r border-zinc-800 z-40 transition-all duration-200',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center h-14 px-4 border-b border-zinc-800 flex-shrink-0',
          collapsed && 'justify-center px-0',
        )}>
          {collapsed
            ? <span className="text-indigo-400 font-bold text-lg">P</span>
            : <span className="text-indigo-400 font-bold text-base tracking-tight">Personal CC</span>
          }
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white',
                  collapsed && 'justify-center px-0',
                )}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: settings + sync */}
        <div className="border-t border-zinc-800 py-3 px-2 space-y-0.5">
          <Link
            href="/settings"
            title={collapsed ? 'Settings' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors',
              collapsed && 'justify-center px-0',
            )}
          >
            <Settings size={18} className="flex-shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>

          <div className={cn('flex items-center gap-3 px-2 py-2', collapsed && 'justify-center px-0')}>
            <SyncDot />
            {!collapsed && <span className="text-xs text-zinc-500">Sync</span>}
          </div>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-900 border-t border-zinc-800 flex">
        {MOBILE_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors',
                active ? 'text-indigo-400' : 'text-zinc-500',
              )}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
