'use client';
import { useState, useEffect, useRef } from 'react';
import { Zap, X } from 'lucide-react';

export default function QuickCapture() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [toast, setToast] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 50);
  }, [open]);

  async function capture() {
    if (!text.trim()) return;
    await fetch('/api/brainstorm/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text.trim(), is_quick_capture: true }),
    });
    setText('');
    setOpen(false);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-4 z-40 w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center shadow-lg transition-colors"
        title="Quick Capture (Ctrl+Shift+B)"
      >
        <Zap size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setOpen(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Zap size={14} className="text-indigo-400" />
                Quick Capture
              </div>
              <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <X size={16} />
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => setText(e.target.value.slice(0, 500))}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) capture(); }}
              placeholder="What's on your mind?"
              rows={4}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-indigo-500"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-zinc-600">{text.length}/500</span>
              <button
                onClick={capture}
                disabled={!text.trim()}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
              >
                Capture
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 right-5 md:bottom-20 z-50 bg-zinc-800 border border-zinc-700 text-sm text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          ⚡ Captured!
        </div>
      )}
    </>
  );
}
