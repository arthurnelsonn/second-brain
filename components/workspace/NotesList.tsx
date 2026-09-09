'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Note } from '@/types';

interface Props {
  projectId: number | null;
  selectedNoteId: number | null;
  onSelect: (note: Note) => void;
}

function plainText(content: string | null): string {
  if (!content) return '';
  try {
    // Tiptap JSON → extract text
    const doc = JSON.parse(content) as { content?: Array<{ content?: Array<{ text?: string }> }> };
    return doc.content
      ?.flatMap(b => b.content?.map(n => n.text ?? '') ?? [])
      .join(' ')
      .slice(0, 100) ?? '';
  } catch {
    return content.slice(0, 100);
  }
}

export default function NotesList({ projectId, selectedNoteId, onSelect }: Props) {
  const qc = useQueryClient();

  const { data: noteList = [], isLoading } = useQuery<Note[]>({
    queryKey: ['notes', projectId],
    queryFn: () =>
      fetch(projectId ? `/api/notes?projectId=${projectId}` : '/api/notes').then(r => r.json()),
    enabled: projectId !== null,
  });

  const createNote = useMutation({
    mutationFn: () =>
      fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, title: 'Untitled' }),
      }).then(r => r.json() as Promise<Note>),
    onSuccess: (note) => {
      qc.invalidateQueries({ queryKey: ['notes', projectId] });
      onSelect(note);
    },
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-3 border-b border-zinc-800">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Notes</span>
        <button
          onClick={() => createNote.mutate()}
          disabled={projectId === null || createNote.isPending}
          className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white disabled:opacity-40 transition-colors"
          title="New note"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {projectId === null && (
          <p className="text-zinc-500 text-sm text-center mt-8 px-4">Select a project to see notes</p>
        )}
        {projectId !== null && isLoading && (
          <p className="text-zinc-500 text-sm text-center mt-8">Loading…</p>
        )}
        {projectId !== null && !isLoading && noteList.length === 0 && (
          <div className="flex flex-col items-center mt-12 gap-2 text-zinc-500">
            <FileText size={24} />
            <p className="text-sm">No notes yet</p>
          </div>
        )}
        {noteList.map(note => {
          const active = selectedNoteId === note.id;
          const preview = plainText(note.content);
          const updatedAt = note.updated_at
            ? formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })
            : '';
          return (
            <button
              key={note.id}
              onClick={() => onSelect(note)}
              className={`w-full text-left px-3 py-3 border-b border-zinc-800/50 transition-colors ${
                active ? 'bg-zinc-700' : 'hover:bg-zinc-800/60'
              }`}
            >
              <p className="text-sm font-medium text-white truncate">{note.title || 'Untitled'}</p>
              {preview && (
                <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{preview}</p>
              )}
              {updatedAt && (
                <p className="text-xs text-zinc-600 mt-1" suppressHydrationWarning>{updatedAt}</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
