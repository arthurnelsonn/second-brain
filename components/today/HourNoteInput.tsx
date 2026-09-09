'use client';

import { useState, useRef } from 'react';
import { Pencil } from 'lucide-react';
import type { DailyNote } from '@/types';

interface Props {
  hour: number;
  noteDate: string;
  existing: DailyNote | undefined;
  onSaved: (note: DailyNote | null) => void;
}

export default function HourNoteInput({ hour, noteDate, existing, onSaved }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue]     = useState(existing?.content ?? '');
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function save() {
    setEditing(false);
    const trimmed = value.trim();
    // Skip API call if nothing changed
    if (trimmed === (existing?.content ?? '')) return;

    const res = await fetch('/api/daily-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note_date: noteDate, hour_block: hour, content: trimmed }),
    });
    const saved = await res.json() as DailyNote | null;
    onSaved(saved);
    setValue(saved?.content ?? '');
  }

  function startEdit() {
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); save(); }
    if (e.key === 'Escape') { setEditing(false); setValue(existing?.content ?? ''); }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={onKeyDown}
        placeholder="Add a note for this hour..."
        className="w-full bg-transparent text-xs text-zinc-300 placeholder-zinc-700 outline-none border-b border-zinc-700 focus:border-indigo-500 py-0.5 transition-colors"
      />
    );
  }

  if (existing?.content) {
    return (
      <button
        onClick={startEdit}
        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors group"
      >
        <Pencil size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="truncate">{existing.content}</span>
      </button>
    );
  }

  return (
    <div
      className="h-full"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {visible && (
        <button
          onClick={startEdit}
          className="text-xs text-zinc-700 hover:text-zinc-500 transition-colors"
        >
          + note
        </button>
      )}
    </div>
  );
}
