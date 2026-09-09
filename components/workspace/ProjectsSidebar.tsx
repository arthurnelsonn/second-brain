'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ChevronRight, Lightbulb, Briefcase, User, Folder } from 'lucide-react';
import type { Project } from '@/types';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  Lightbulb, Briefcase, User, Folder,
};

const PRESET_COLORS = [
  '#6366F1', '#7C3AED', '#2563EB', '#16A34A',
  '#D97706', '#DC2626', '#0891B2', '#DB2777',
];

interface Props {
  selectedId: number | null;
  onSelect: (id: number) => void;
  noteCounts: Record<number, number>;
}

export default function ProjectsSidebar({ selectedId, onSelect, noteCounts }: Props) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366F1');
  const [icon, setIcon] = useState('Folder');

  const { data: projectList = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => fetch('/api/projects').then(r => r.json()),
  });

  const createProject = useMutation({
    mutationFn: (payload: { name: string; color: string; icon: string }) =>
      fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      setShowForm(false);
      setName('');
      setColor('#6366F1');
      setIcon('Folder');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createProject.mutate({ name: name.trim(), color, icon });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-3 border-b border-zinc-800">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Projects</span>
        <button
          onClick={() => setShowForm(v => !v)}
          className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          title="New project"
        >
          <Plus size={14} />
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-3 border-b border-zinc-800 space-y-2">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Project name"
            className="w-full bg-zinc-800 text-sm text-white rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <div className="flex flex-wrap gap-1">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-5 h-5 rounded-full border-2 transition-all"
                style={{
                  backgroundColor: c,
                  borderColor: color === c ? 'white' : 'transparent',
                }}
              />
            ))}
          </div>
          <div className="flex gap-1">
            {Object.keys(ICON_MAP).map(k => {
              const Icon = ICON_MAP[k];
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setIcon(k)}
                  className={`p-1 rounded transition-colors ${icon === k ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-zinc-700'}`}
                >
                  <Icon size={14} />
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!name.trim() || createProject.isPending}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs rounded py-1 transition-colors"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white text-xs rounded py-1 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <nav className="flex-1 overflow-y-auto py-1">
        {projectList.map(p => {
          const Icon = ICON_MAP[p.icon ?? ''] ?? Folder;
          const count = noteCounts[p.id] ?? 0;
          const active = selectedId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                active ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <Icon size={14} style={{ color: p.color ?? '#6366F1' }} />
              <span className="flex-1 text-left truncate">{p.name}</span>
              {count > 0 && (
                <span className="text-xs bg-zinc-600 text-zinc-300 rounded-full px-1.5 py-0.5 leading-none">
                  {count}
                </span>
              )}
              {active && <ChevronRight size={12} className="text-zinc-500" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
