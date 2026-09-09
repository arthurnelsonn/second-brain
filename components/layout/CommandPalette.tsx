'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, CalendarDays, CheckSquare, Brain, Mail, FileText, ShoppingCart, Settings, X } from 'lucide-react';
import { useUiStore } from '@/store';
import { cn } from '@/lib/utils';

const COMMANDS = [
  { id: 'today',      label: 'Today',      href: '/today',      icon: Home },
  { id: 'calendar',   label: 'Calendar',   href: '/calendar',   icon: CalendarDays },
  { id: 'tasks',      label: 'Tasks',      href: '/tasks',      icon: CheckSquare },
  { id: 'brainstorm', label: 'Brainstorm', href: '/brainstorm', icon: Brain },
  { id: 'email',      label: 'Email',      href: '/email',      icon: Mail },
  { id: 'workspace',  label: 'Workspace',  href: '/workspace',  icon: FileText },
  { id: 'grocery',    label: 'Grocery',    href: '/grocery',    icon: ShoppingCart },
  { id: 'settings',   label: 'Settings',   href: '/settings',   icon: Settings },
] as const;

export default function CommandPalette() {
  const open = useUiStore((s) => s.commandPaletteOpen);
  const setOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()),
  );

  // Reset state when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, setOpen]);

  const navigate = useCallback((href: string) => {
    setOpen(false);
    router.push(href);
  }, [router, setOpen]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (filtered[activeIndex]) navigate(filtered[activeIndex].href);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 border-b border-zinc-700">
          <span className="text-zinc-500 text-sm">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={onKeyDown}
            placeholder="Search commands..."
            className="flex-1 bg-transparent py-4 text-sm text-white placeholder-zinc-500 outline-none"
          />
          <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <ul className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 && (
            <li className="px-4 py-3 text-sm text-zinc-500">No results</li>
          )}
          {filtered.map(({ id, label, href, icon: Icon }, idx) => (
            <li key={id}>
              <button
                onClick={() => navigate(href)}
                onMouseEnter={() => setActiveIndex(idx)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                  idx === activeIndex
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-300 hover:bg-zinc-800',
                )}
              >
                <Icon size={16} className="flex-shrink-0" />
                {label}
              </button>
            </li>
          ))}
        </ul>

        <div className="px-4 py-2 border-t border-zinc-800 flex gap-4 text-xs text-zinc-600">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
