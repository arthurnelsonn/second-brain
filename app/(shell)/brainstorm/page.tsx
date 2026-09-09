'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Copy, Check, Save, Clock, ChevronRight } from 'lucide-react';
import type { BrainDump } from '@/types';

type Mode = 'organize' | 'critique' | 'expand';
type Tab = 'new' | 'history';

const MODES: { key: Mode; label: string }[] = [
  { key: 'organize', label: 'Organize ✦' },
  { key: 'critique', label: 'Critique ✦' },
  { key: 'expand',   label: 'Expand ✦'   },
];

export default function BrainstormPage() {
  const [tab, setTab] = useState<Tab>('new');
  const [content, setContent] = useState('');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [activeMode, setActiveMode] = useState<Mode | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [aiText, setAiText] = useState('');
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedToWs, setSavedToWs] = useState(false);
  const [history, setHistory] = useState<BrainDump[]>([]);
  const [toast, setToast] = useState('');
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionIdRef = useRef<number | null>(null);

  // Keep ref in sync so async callbacks always have latest value
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  // Auto-save every 5s
  useEffect(() => {
    if (!content.trim()) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      const sid = sessionIdRef.current;
      const res = await fetch('/api/brainstorm/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sid ?? undefined, content }),
      });
      const data = await res.json() as BrainDump;
      if (!sid) setSessionId(data.id);
    }, 5000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [content]);

  const loadHistory = useCallback(async () => {
    const res = await fetch('/api/brainstorm/history');
    setHistory(await res.json() as BrainDump[]);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);
  useEffect(() => { if (tab === 'history') loadHistory(); }, [tab, loadHistory]);

  async function runMode(mode: Mode) {
    if (!content.trim() || streaming) return;
    setActiveMode(mode);
    setStreaming(true);
    setAiText('');
    setDone(false);
    setSavedToWs(false);

    const res = await fetch('/api/ai/brainstorm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, mode }),
    });

    if (!res.ok || !res.body) {
      const err = await res.json() as { error: string };
      setAiText(`Error: ${err.error}`);
      setStreaming(false);
      setDone(true);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = '';
    while (true) {
      const { done: d, value } = await reader.read();
      if (d) break;
      full += decoder.decode(value);
      setAiText(full);
    }

    setStreaming(false);
    setDone(true);

    const sid = sessionIdRef.current;
    if (sid) {
      await fetch('/api/brainstorm/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sid, content, mode, ai_response: full }),
      });
    } else {
      const r = await fetch('/api/brainstorm/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, mode, ai_response: full }),
      });
      const data = await r.json() as BrainDump;
      setSessionId(data.id);
    }
  }

  async function copyResponse() {
    await navigator.clipboard.writeText(aiText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function saveToWorkspace() {
    try {
      const projRes = await fetch('/api/projects');
      if (!projRes.ok) throw new Error('Could not load projects');
      const projects = await projRes.json() as Array<{ id: number; name: string }>;
      const brainstormProject = projects.find(p => p.name === 'Brainstorm');
      const project_id = brainstormProject?.id ?? null;

      const date = new Date().toISOString().split('T')[0];
      const noteRes = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id, title: `Brainstorm — ${date}`, content: aiText }),
      });
      if (!noteRes.ok) {
        const body = await noteRes.text();
        throw new Error(`Note save failed (${noteRes.status}): ${body}`);
      }
      const note = await noteRes.json() as { id: number };

      let sid = sessionIdRef.current;
      if (!sid) {
        const r = await fetch('/api/brainstorm/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, mode: activeMode ?? undefined, ai_response: aiText }),
        });
        const dump = await r.json() as BrainDump;
        sid = dump.id;
        setSessionId(sid);
      }

      await fetch('/api/brainstorm/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sid,
          content,
          mode: activeMode ?? undefined,
          ai_response: aiText,
          saved_note_id: note.id,
        }),
      });

      setSavedToWs(true);
      showToast('✓ Saved to Workspace — Brainstorm project');
    } catch (err) {
      showToast(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  function restoreSession(dump: BrainDump) {
    setContent(dump.content);
    setSessionId(dump.id);
    setAiText(dump.ai_response ?? '');
    setDone(!!dump.ai_response);
    setActiveMode((dump.mode as Mode) ?? null);
    setSavedToWs(false);
    setTab('new');
  }

  function newSession() {
    setContent('');
    setSessionId(null);
    setAiText('');
    setDone(false);
    setActiveMode(null);
    setStreaming(false);
    setSavedToWs(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 pt-4 pb-0 border-b border-zinc-800">
        {(['new', 'history'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              tab === t ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t === 'new' ? 'New Dump' : `History (${history.length})`}
          </button>
        ))}
        {tab === 'new' && sessionId && (
          <button onClick={newSession} className="ml-auto mr-2 text-xs text-zinc-500 hover:text-zinc-300 pb-2">
            + New session
          </button>
        )}
      </div>

      {tab === 'history' ? (
        <HistoryTab history={history} onRestore={restoreSession} />
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT PANE */}
          <div className="flex flex-col w-1/2 border-r border-zinc-800 p-4 gap-3">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={"Dump everything on your mind here.\nDon't edit. Don't organize. Just write."}
              className="flex-1 bg-transparent text-white font-mono text-base leading-relaxed resize-none focus:outline-none placeholder-zinc-600"
            />
            <div className="flex gap-2 flex-wrap">
              {MODES.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => runMode(key)}
                  disabled={!content.trim() || streaming}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    activeMode === key && streaming
                      ? 'bg-indigo-700 text-white animate-pulse'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                  }`}
                >
                  {activeMode === key && streaming
                    ? <><Sparkles size={14} className="animate-spin" />{label}</>
                    : label}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT PANE */}
          <div className="flex flex-col w-1/2 p-4 overflow-y-auto">
            {!aiText && !streaming ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-zinc-600">
                <Sparkles size={32} />
                <p className="text-sm max-w-xs">
                  Your AI thinking partner is ready.<br />Write something and choose a mode.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {activeMode && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-900/50 text-indigo-300 capitalize">
                      {activeMode}
                    </span>
                  )}
                  {streaming && <span className="text-xs text-zinc-500 animate-pulse">Thinking…</span>}
                  {done && (
                    <div className="ml-auto flex gap-2">
                      <button
                        onClick={copyResponse}
                        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors"
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        onClick={saveToWorkspace}
                        disabled={savedToWs}
                        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                      >
                        <Save size={12} />
                        {savedToWs ? 'Saved ✓' : 'Save to Workspace →'}
                      </button>
                    </div>
                  )}
                </div>
                <div className="prose prose-invert prose-sm max-w-none text-zinc-200">
                  <ReactMarkdown>{aiText}</ReactMarkdown>
                </div>
                {streaming && <span className="inline-block w-1.5 h-4 bg-indigo-400 animate-pulse ml-0.5 mt-1" />}
              </>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-800 border border-zinc-700 text-sm text-white px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function HistoryTab({ history, onRestore }: { history: BrainDump[]; onRestore: (d: BrainDump) => void }) {
  if (!history.length) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-2">
        <Clock size={28} />
        <p className="text-sm">No past sessions yet.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {history.map(dump => (
        <button
          key={dump.id}
          onClick={() => onRestore(dump)}
          className="w-full text-left p-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-colors group"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-zinc-500" suppressHydrationWarning>
              {dump.created_at
                ? new Date(typeof dump.created_at === 'number' ? dump.created_at * 1000 : dump.created_at)
                    .toISOString().split('T')[0]
                : ''}
            </span>
            {dump.mode && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-900/50 text-indigo-300 capitalize">
                {dump.mode}
              </span>
            )}
            {dump.ai_response && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-zinc-700 text-zinc-300">✦ AI</span>
            )}
            <ChevronRight size={14} className="ml-auto text-zinc-600 group-hover:text-zinc-400" />
          </div>
          <p className="text-sm text-zinc-400 line-clamp-2">{dump.content.slice(0, 100)}</p>
        </button>
      ))}
    </div>
  );
}
