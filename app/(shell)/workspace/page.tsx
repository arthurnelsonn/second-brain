'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ProjectsSidebar from '@/components/workspace/ProjectsSidebar';
import NotesList from '@/components/workspace/NotesList';
import NoteEditor from '@/components/workspace/NoteEditor';
import type { Note } from '@/types';
import { FolderOpen, FileText, PenLine } from 'lucide-react';

type MobileTab = 'projects' | 'notes' | 'editor';

export default function WorkspacePage() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>('projects');

  // Fetch note counts per project for badges
  const { data: allNotes = [] } = useQuery<Note[]>({
    queryKey: ['notes', 'all'],
    queryFn: () => fetch('/api/notes?all=1').then(r => r.json()),
  });

  const noteCounts: Record<number, number> = {};
  for (const n of allNotes) {
    if (n.project_id != null) {
      noteCounts[n.project_id] = (noteCounts[n.project_id] ?? 0) + 1;
    }
  }

  function handleProjectSelect(id: number) {
    setSelectedProjectId(id);
    setSelectedNote(null);
    setMobileTab('notes');
  }

  function handleNoteSelect(note: Note) {
    setSelectedNote(note);
    setMobileTab('editor');
  }

  function handleNoteSaved(updated: Note) {
    setSelectedNote(updated);
  }

  const TABS: { key: MobileTab; label: string; Icon: React.ComponentType<{ size?: number }> }[] = [
    { key: 'projects', label: 'Projects', Icon: FolderOpen },
    { key: 'notes',    label: 'Notes',    Icon: FileText },
    { key: 'editor',   label: 'Editor',   Icon: PenLine },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Mobile tab bar */}
      <div className="flex md:hidden border-b border-zinc-800">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setMobileTab(key)}
            className={`flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors ${
              mobileTab === key ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-zinc-500'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Desktop: three-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Projects column — 200px desktop, hidden on mobile unless active tab */}
        <div className={`
          w-full md:w-[200px] md:flex-shrink-0 border-r border-zinc-800 overflow-hidden
          ${mobileTab === 'projects' ? 'flex' : 'hidden'} md:flex flex-col
        `}>
          <ProjectsSidebar
            selectedId={selectedProjectId}
            onSelect={handleProjectSelect}
            noteCounts={noteCounts}
          />
        </div>

        {/* Notes list — 280px desktop */}
        <div className={`
          w-full md:w-[280px] md:flex-shrink-0 border-r border-zinc-800 overflow-hidden
          ${mobileTab === 'notes' ? 'flex' : 'hidden'} md:flex flex-col
        `}>
          <NotesList
            projectId={selectedProjectId}
            selectedNoteId={selectedNote?.id ?? null}
            onSelect={handleNoteSelect}
          />
        </div>

        {/* Editor — flex-1 */}
        <div className={`
          flex-1 overflow-hidden
          ${mobileTab === 'editor' ? 'flex' : 'hidden'} md:flex flex-col
        `}>
          {selectedNote ? (
            <NoteEditor
              key={selectedNote.id}
              note={selectedNote}
              onSaved={handleNoteSaved}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-3">
              <PenLine size={40} />
              <p className="text-sm">Select or create a note to start writing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
