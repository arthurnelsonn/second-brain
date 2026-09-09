'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import TodaySummaryCard from '@/components/today/TodaySummaryCard';
import TimeBlockGrid from '@/components/today/TimeBlockGrid';
import type { CalendarEvent, Task, MorningPlan, DailyNote } from '@/types';

const TODAY = new Date().toISOString().split('T')[0];

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json() as Promise<T>;
}

export default function TodayPage() {
  const [notes, setNotes] = useState<DailyNote[]>([]);

  const { data: events = [] } = useQuery<CalendarEvent[]>({
    queryKey: ['calendar-events', 'today'],
    queryFn: () => fetchJson('/api/calendar/events?date=today'),
  });

  const { data: dueTasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks', 'due-today'],
    queryFn: () => fetchJson('/api/tasks?due=today'),
  });

  const { data: scheduledTasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks', 'scheduled-today'],
    queryFn: () => fetchJson('/api/tasks?scheduled=today'),
  });

  const { data: completedTasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks', 'completed-today'],
    queryFn: () => fetchJson('/api/tasks?completed=today'),
  });

  const { data: plan = null } = useQuery<MorningPlan | null>({
    queryKey: ['morning-plan', 'today'],
    queryFn: () => fetchJson('/api/morning/today'),
  });

  const { data: fetchedNotes = [] } = useQuery<DailyNote[]>({
    queryKey: ['daily-notes', TODAY],
    queryFn: () => fetchJson(`/api/daily-notes?date=${TODAY}`),
  });

  // Seed local notes state from fetched data
  useEffect(() => {
    if (fetchedNotes.length > 0) setNotes(fetchedNotes);
  }, [fetchedNotes]);

  function handleNoteChange(note: DailyNote | null, hour: number) {
    setNotes((prev) => {
      const filtered = prev.filter((n) => n.hour_block !== hour);
      return note ? [...filtered, note] : filtered;
    });
  }

  // Deduplicate: scheduled tasks take priority, then due tasks
  const allTasks = [
    ...scheduledTasks,
    ...dueTasks.filter((t) => !scheduledTasks.some((s) => s.id === t.id)),
  ];

  return (
    <div className="min-h-full bg-zinc-950 text-white">
      <TodaySummaryCard
        events={events}
        tasks={dueTasks}
        completed={completedTasks}
        plan={plan}
      />
      <div className="border-t border-zinc-800">
        <TimeBlockGrid
          events={events}
          tasks={allTasks}
          notes={notes}
          noteDate={TODAY}
          onNoteChange={handleNoteChange}
        />
      </div>
    </div>
  );
}
