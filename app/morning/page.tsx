'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Clock, CheckSquare, Mail, ArrowRight, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CalendarEvent, Task } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayString() {
  return new Date().toISOString().split('T')[0];
}

const PRIORITY_LABEL: Record<number, { label: string; className: string }> = {
  1: { label: 'P1', className: 'bg-red-500/20 text-red-400' },
  2: { label: 'P2', className: 'bg-orange-500/20 text-orange-400' },
  3: { label: 'P3', className: 'bg-yellow-500/20 text-yellow-400' },
  4: { label: 'P4', className: 'bg-zinc-700 text-zinc-400' },
};

// ─── Step variants ────────────────────────────────────────────────────────────

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

const transition = { type: 'tween', duration: 0.3, ease: 'easeInOut' } as const;

// ─── Progress dots ────────────────────────────────────────────────────────────

function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-2 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            i === step ? 'w-6 bg-indigo-500' : 'w-2 bg-zinc-700',
          )}
        />
      ))}
    </div>
  );
}

// ─── Step 1: Day at a Glance ──────────────────────────────────────────────────

function StepDayGlance({ onNext }: { onNext: () => void }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks]   = useState<Task[]>([]);

  useEffect(() => {
    fetch('/api/calendar/events?date=today').then(r => r.json()).then(setEvents).catch(() => null);
    fetch('/api/tasks?due=today').then(r => r.json()).then(setTasks).catch(() => null);
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Sun size={36} className="text-indigo-400 mx-auto mb-3" />
        <h1 className="text-2xl font-bold">Good morning.</h1>
        <p className="text-zinc-400 mt-1 text-sm">Here&apos;s your day at a glance.</p>
      </div>

      {/* Events */}
      <section>
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          <Clock size={12} />
          <span>Today&apos;s Events</span>
        </div>
        {events.length === 0 ? (
          <p className="text-zinc-600 text-sm py-2">No events scheduled today.</p>
        ) : (
          <ul className="space-y-2">
            {events.map((e) => (
              <li key={e.id} className="flex items-center gap-3 bg-zinc-900 rounded-lg px-3 py-2.5">
                <span className="text-xs text-zinc-500 w-12 flex-shrink-0">
                  {e.start_at ? new Date(e.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                </span>
                <span className="text-sm text-white truncate">{e.title}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Tasks */}
      <section>
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          <CheckSquare size={12} />
          <span>Tasks Due Today</span>
        </div>
        {tasks.length === 0 ? (
          <p className="text-zinc-600 text-sm py-2">No tasks due today.</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((t) => {
              const p = PRIORITY_LABEL[t.priority ?? 4];
              return (
                <li key={t.id} className="flex items-center gap-3 bg-zinc-900 rounded-lg px-3 py-2.5">
                  <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded flex-shrink-0', p.className)}>{p.label}</span>
                  <span className="text-sm text-white truncate">{t.title}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Email brief placeholder */}
      <section>
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          <Mail size={12} />
          <span>Email Brief</span>
        </div>
        <div className="bg-zinc-900 rounded-lg px-3 py-3 text-sm text-zinc-500 flex items-center gap-2">
          <Mail size={14} />
          Connect email to see your brief.
        </div>
      </section>

      <button
        onClick={onNext}
        className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors"
      >
        Continue <ArrowRight size={16} />
      </button>
    </div>
  );
}

// ─── Step 2: Primary Focus ────────────────────────────────────────────────────

function StepPrimaryFocus({
  value, onChange, onNext, onSkip,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const MAX = 120;
  const canContinue = value.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Set Your Primary Focus</h1>
        <p className="text-zinc-400 mt-2 text-sm">
          What is the ONE thing that would make today a success?
        </p>
      </div>

      <div className="space-y-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX))}
          placeholder="e.g. Finish the project proposal draft"
          rows={3}
          autoFocus
          className="w-full bg-zinc-900 border border-zinc-700 focus:border-indigo-500 rounded-lg px-4 py-3 text-white placeholder-zinc-600 text-sm resize-none outline-none transition-colors"
        />
        <div className="text-right text-xs text-zinc-600">
          {value.length}/{MAX}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!canContinue}
        className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
      >
        Continue <ArrowRight size={16} />
      </button>

      <button
        onClick={onSkip}
        className="w-full text-center text-sm text-zinc-600 hover:text-zinc-400 transition-colors py-1"
      >
        Skip for today
      </button>
    </div>
  );
}

// ─── Step 3: Reflection ───────────────────────────────────────────────────────

function StepReflection({
  value, onChange, onSubmit, loading,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Morning Reflection</h1>
        <p className="text-zinc-400 mt-2 text-sm">Optional — any thoughts, intentions, or gratitude?</p>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="I'm grateful for... Today I intend to..."
        rows={5}
        autoFocus
        className="w-full bg-zinc-900 border border-zinc-700 focus:border-indigo-500 rounded-lg px-4 py-3 text-white placeholder-zinc-600 text-sm resize-none outline-none transition-colors"
      />

      <button
        onClick={onSubmit}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg font-medium transition-colors"
      >
        {loading ? 'Saving...' : <><span>Begin My Day</span><ChevronRight size={16} /></>}
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MorningRitualPage() {
  const router = useRouter();
  const [step, setStep]           = useState(0);
  const [direction, setDirection] = useState(1);
  const [focus, setFocus]         = useState('');
  const [reflection, setReflection] = useState('');
  const [loading, setLoading]     = useState(false);

  function goNext() {
    setDirection(1);
    setStep((s) => s + 1);
  }

  async function handleSkip() {
    setLoading(true);
    await fetch('/api/morning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_date: todayString(), skipped: true }),
    });
    router.replace('/today');
  }

  async function handleSubmit() {
    setLoading(true);
    await fetch('/api/morning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan_date:     todayString(),
        primary_focus: focus.trim() || null,
        reflection:    reflection.trim() || null,
        skipped:       false,
      }),
    });
    router.replace('/today');
  }

  const steps = [
    <StepDayGlance key="glance" onNext={goNext} />,
    <StepPrimaryFocus
      key="focus"
      value={focus}
      onChange={setFocus}
      onNext={goNext}
      onSkip={handleSkip}
    />,
    <StepReflection
      key="reflect"
      value={reflection}
      onChange={setReflection}
      onSubmit={handleSubmit}
      loading={loading}
    />,
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <ProgressDots step={step} total={steps.length} />

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              {steps[step]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
