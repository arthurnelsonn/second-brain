'use client';

import { useUiStore } from '@/store';
import { cn } from '@/lib/utils';

export default function ShellMain({ children }: { children: React.ReactNode }) {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  return (
    <div className={cn('flex flex-col flex-1 min-w-0 transition-all duration-200', collapsed ? 'md:ml-16' : 'md:ml-60')}>
      {children}
    </div>
  );
}
