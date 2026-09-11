'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Sparkles, Bold, Italic, List, ListOrdered, Code, X, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Note } from '@/types';

interface Props {
  note: Note;
  onSaved?: (updated: Note) => void;
}

type SaveStatus = 'idle' | 'saving' | 'saved';

export default function NoteEditor({ note, onSaved }: Props) {
  const [title, setTitle]           = useState(note.title);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const debounceRef                 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestNoteId                = useRef(note.id);

  // AI drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [question, setQuestion]     = useState('');
  const [aiAnswer, setAiAnswer]     = useState('');
  const [aiLoading, setAiLoading]   = useState(false);
  const editorRef                   = useRef<ReturnType<typeof useEditor>>(null);

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
      try {
        const parsed = JSON.parse(note.content);
        if (parsed && typeof parsed === 'object' && parsed.type === 'doc') return parsed;
        return note.content;
      } catch { return note.content; }
    })(),
    editorProps: {
      attributes: { class: 'prose prose-invert prose-sm max-w-none focus:outline-none min-h-[300px] px-1' },
    },
    onUpdate: ({ editor: ed }) => {
      scheduleSave({ content: JSON.stringify(ed.getJSON()) });
    },
  });

  // Keep ref in sync for AI drawer access
  useEffect(() => { editorRef.current = editor; }, [editor]);

  // Reset editor when note changes
  useEffect(() => {
    latestNoteId.current = note.id;
    setTitle(note.title);
    setDrawerOpen(false);
    setAiAnswer('');
    setQuestion('');
    if (editor) {
      const parsed = (() => {
        if (!note.content) return '';
        try {
          const p = JSON.parse(note.content);
          if (p && typeof p === 'object' && p.type === 'doc') return p;
          return note.content;
        } catch { return note.content; }
      })();
      editor.commands.setContent(parsed);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
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

  async function handleAskAI(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || aiLoading) return;

    const noteContent = editorRef.current
      ? editorRef.current.getText()
      : note.content ?? '';

    setAiLoading(true);
    setAiAnswer('');

    try {
      const res = await fetch('/api/ai/note-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteContent, question }),
      });

      if (!res.ok || !res.body) throw new Error('Request failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setAiAnswer(accumulated);
      }
    } catch (err) {
      setAiAnswer(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setAiLoading(false);
    }
  }

  if (!editor) return null;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main editor area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-zinc-800 flex-shrink-0">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors ${editor.isActive('bold') ? 'bg-zinc-700 text-white' : ''}`}
            title="Bold"
          ><Bold size={14} /></button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors ${editor.isActive('italic') ? 'bg-zinc-700 text-white' : ''}`}
            title="Italic"
          ><Italic size={14} /></button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors ${editor.isActive('bulletList') ? 'bg-zinc-700 text-white' : ''}`}
            title="Bullet list"
          ><List size={14} /></button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors ${editor.isActive('orderedList') ? 'bg-zinc-700 text-white' : ''}`}
            title="Ordered list"
          ><ListOrdered size={14} /></button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors ${editor.isActive('code') ? 'bg-zinc-700 text-white' : ''}`}
            title="Inline code"
          ><Code size={14} /></button>

          <div className="flex-1" />

          {saveStatus !== 'idle' && (
            <span className="text-xs text-zinc-500 mr-2">
              {saveStatus === 'saving' ? 'Saving…' : '✓ Saved'}
            </span>
          )}

          <button
            onClick={() => setDrawerOpen(o => !o)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              drawerOpen
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            <Sparkles size={12} />
            Ask AI
          </button>
        </div>

        {/* Title */}
        <div className="px-6 pt-6 pb-2 flex-shrink-0">
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

      {/* AI Drawer */}
      {drawerOpen && (
        <div className="w-80 flex-shrink-0 border-l border-zinc-800 flex flex-col bg-zinc-950">
          {/* Drawer header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Sparkles size={14} className="text-indigo-400" />
              Ask AI about this note
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Answer area */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {!aiAnswer && !aiLoading && (
              <p className="text-zinc-600 text-xs text-center mt-8">
                Ask anything about the content of this note.
              </p>
            )}
            {aiLoading && !aiAnswer && (
              <div className="flex items-center gap-2 text-zinc-500 text-xs mt-8 justify-center">
                <Loader2 size={14} className="animate-spin" />
                Thinking…
              </div>
            )}
            {aiAnswer && (
              <div className="prose prose-invert prose-xs max-w-none text-sm">
                <ReactMarkdown>{aiAnswer}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Question input */}
          <form onSubmit={handleAskAI} className="p-3 border-t border-zinc-800">
            <div className="flex gap-2">
              <input
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Ask anything about this note…"
                disabled={aiLoading}
                className="flex-1 bg-zinc-800 text-white text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500 placeholder-zinc-600 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!question.trim() || aiLoading}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg transition-colors flex-shrink-0"
              >
                {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
