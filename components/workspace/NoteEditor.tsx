'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Sparkles, Bold, Italic, List, ListOrdered, Code } from 'lucide-react';
import type { Note } from '@/types';

interface Props {
  note: Note;
  onSaved?: (updated: Note) => void;
}

type SaveStatus = 'idle' | 'saving' | 'saved';

export default function NoteEditor({ note, onSaved }: Props) {
  const [title, setTitle] = useState(note.title);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestNoteId = useRef(note.id);

  const save = useCallback(async (payload: { title?: string; content?: string }) => {
    setSaveStatus('saving');
    try {
      const res = await fetch(`/api/notes/${latestNoteId.current}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const updated = await res.json() as Note;
      setSaveStatus('saved');
      onSaved?.(updated);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('idle');
    }
  }, [onSaved]);

  function scheduleSave(payload: { title?: string; content?: string }) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(payload), 3000);
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing…' }),
    ],
    content: (() => {
      if (!note.content) return '';
      try { return JSON.parse(note.content); } catch { return note.content; }
    })(),
    editorProps: {
      attributes: { class: 'prose prose-invert prose-sm max-w-none focus:outline-none min-h-[300px] px-1' },
    },
    onUpdate: ({ editor: ed }) => {
      scheduleSave({ content: JSON.stringify(ed.getJSON()) });
    },
  });

  // Reset editor when note changes
  useEffect(() => {
    latestNoteId.current = note.id;
    setTitle(note.title);
    if (editor) {
      const parsed = (() => {
        if (!note.content) return '';
        try { return JSON.parse(note.content); } catch { return note.content; }
      })();
      editor.commands.setContent(parsed);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id]);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
    scheduleSave({ title: e.target.value });
  }

  function handleTitleBlur() {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      save({ title });
    }
  }

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-zinc-800">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors ${editor.isActive('bold') ? 'bg-zinc-700 text-white' : ''}`}
          title="Bold"
        >
          <Bold size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors ${editor.isActive('italic') ? 'bg-zinc-700 text-white' : ''}`}
          title="Italic"
        >
          <Italic size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors ${editor.isActive('bulletList') ? 'bg-zinc-700 text-white' : ''}`}
          title="Bullet list"
        >
          <List size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors ${editor.isActive('orderedList') ? 'bg-zinc-700 text-white' : ''}`}
          title="Ordered list"
        >
          <ListOrdered size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors ${editor.isActive('code') ? 'bg-zinc-700 text-white' : ''}`}
          title="Inline code"
        >
          <Code size={14} />
        </button>

        <div className="flex-1" />

        {/* Save status */}
        {saveStatus !== 'idle' && (
          <span className="text-xs text-zinc-500 mr-2">
            {saveStatus === 'saving' ? 'Saving…' : '✓ Saved'}
          </span>
        )}

        {/* Ask AI — Phase 2 */}
        <div className="relative group">
          <button
            disabled
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-800 text-zinc-500 text-xs cursor-not-allowed"
          >
            <Sparkles size={12} />
            Ask AI
          </button>
          <div className="absolute right-0 top-full mt-1 px-2 py-1 bg-zinc-700 text-zinc-300 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            Available in Phase 2
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="px-6 pt-6 pb-2">
        <input
          value={title}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          placeholder="Untitled"
          className="w-full text-2xl font-bold text-white bg-transparent outline-none placeholder-zinc-600"
        />
      </div>

      {/* Editor body */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
