'use client';

import { Target, CalendarDays, CheckSquare, CheckCheck } from 'lucide-react';
import type { CalendarEvent, Task, MorningPlan } from '@/types';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDay(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

interface Props {
  events:    CalendarEvent[];
  tasks:     Task[];
  completed: Task[];
  plan:      MorningPlan | null;
}

export default function TodaySummaryCard({ events, tasks, completed, plan }: Props) {
  return (
    <div className="space-y-3 p-4 md:p-6">
      {/* Date + greeting */}
      <div>
        <p className="text-zinc-500 text-sm">{formatDay(new Date())}</p>
        <h1 className="text-2xl font-bold text-white">{greeting()}</h1>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-3">
        <Stat icon={<CalendarDays size={14} />} label="events" value={events.length} color="text-indigo-400" />
        <Stat icon={<CheckSquare size={14} />}  label="due today" value={tasks.length} color="text-yellow-400" />
        <Stat icon={<CheckCheck size={14} />}   label="completed" value={completed.length} color="text-green-400" />
      </div>

      {/* Primary focus */}
      {plan?.primary_focus && (
        <div className="flex items-start gap-3 bg-indigo-950/60 border border-indigo-800/50 rounded-lg px-4 py-3">
          <Target size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-indigo-400 font-medium mb-0.5">Today&apos;s Focus</p>
            <p className="text-sm text-white">{plan.primary_focus}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-zinc-900 rounded-lg px-3 py-2">
      <span className={color}>{icon}</span>
      <span className="text-white font-semibold text-sm">{value}</span>
      <span className="text-zinc-500 text-xs">{label}</span>
    </div>
  );
}
